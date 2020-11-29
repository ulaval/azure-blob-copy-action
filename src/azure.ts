import * as core from "@actions/core";
import * as azure from "@azure/storage-blob";
import * as Path from "path";
import { resolveContentType } from "./contenttype";
import * as files from "./files";

export class Blob {}

export class AzureBlobStorage {
  static async create(connectionString: string, containerName: string): Promise<AzureBlobStorage> {
    const blobServiceClient = azure.BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (!(await containerClient.exists())) {
      throw new Error(`The container ${containerName} does not exist.`);
    }

    return new AzureBlobStorage(containerClient);
  }

  constructor(private containerClient: azure.ContainerClient) {}

  async uploadFiles(rootPath: string): Promise<number> {
    files.checkReadAccess(rootPath);

    const i = [0];
    await files.walkFiles(rootPath, async (filePath: string) => {
      await this.uploadFile(rootPath, filePath);
      ++i[0];
    });

    return i[0];
  }

  async downloadFiles(destPath: string): Promise<number> {
    files.checkWriteAccess(destPath);

    let i = 1;
    for await (const response of this.containerClient
      .listBlobsByHierarchy("/", { prefix: "prefix2/sub1/" })
      .byPage({ maxPageSize: 2 })) {
      console.log(`Page ${i++}`);
      const segment = response.segment;

      if (segment.blobPrefixes) {
        for (const prefix of segment.blobPrefixes) {
          console.log(`\tBlobPrefix: ${prefix.name}`);
        }
      }

      for (const blob of response.segment.blobItems) {
        console.log(`\tBlobItem: name - ${blob.name}, last modified - ${blob.properties.lastModified}`);
      }
    }
    return 0;
  }

  async walkBlobs(
    callback: (blob: azure.BlobItem) => Promise<void>,
    options: azure.ContainerListBlobsOptions = {},
  ): Promise<void> {
    for await (const response of this.containerClient.listBlobsFlat(options).byPage({ maxPageSize: 50 })) {
      for (const blob of response.segment.blobItems) {
        console.log(`\tBlobItem: name - ${blob.name}, last modified - ${blob.properties.lastModified}`);
        callback(blob);
      }
    }
  }

  async uploadFile(rootPath: string, filePath: string, contentTypeHeaders: azure.BlobHTTPHeaders = {}): Promise<void> {
    core.info(`Uploading ${filePath}...`);
    const relativePath = Path.relative(rootPath, filePath);
    const blobName = relativePath.replace(/\\/g, "/");

    if (!contentTypeHeaders.blobContentType) {
      contentTypeHeaders.blobContentType = resolveContentType(relativePath) || undefined;
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadFile(filePath, { blobHTTPHeaders: contentTypeHeaders });
  }

  async downloadFile(srcBlobPath: string, destFilePath: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(srcBlobPath);
    await blockBlobClient.downloadToFile(destFilePath);
  }
}
