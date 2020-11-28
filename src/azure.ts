import * as core from "@actions/core";
import { BlobHTTPHeaders, BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import * as Path from "path";
import { resolveContentType } from "./contenttype";
import * as files from "./files";

export class Blob {}

export class AzureBlobStorage {
  static async create(connectionString: string, containerName: string): Promise<AzureBlobStorage> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (!(await containerClient.exists())) {
      throw new Error(`The container ${containerName} does not exist.`);
    }

    return new AzureBlobStorage(containerClient);
  }

  constructor(private containerClient: ContainerClient) {}

  async uploadFiles(rootPath: string): Promise<number> {
    files.checkReadAccess(rootPath);

    const i = [0];
    await files.walkFiles(rootPath, async (filePath: string) => {
      await this.uploadFile(rootPath, filePath);
      ++i[0];
    });

    return i[0];
  }

  async uploadFile(rootPath: string, filePath: string, contentTypeHeaders: BlobHTTPHeaders = {}): Promise<void> {
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
