import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import * as Path from "path";
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

    let i = 0;
    await files.walkFiles(rootPath, async (filePath: string) => {
      await this.uploadFile(rootPath, filePath);
      ++i;
    });

    return i;
  }

  async uploadFile(rootPath: string, filePath: string): Promise<void> {
    const relativePath = Path.relative(rootPath, filePath);
    const blockBlobClient = this.containerClient.getBlockBlobClient(relativePath);
    await blockBlobClient.uploadFile(filePath.replace(/\\/g, "/"));
  }

  async downloadFile(srcBlobPath: string, destFilePath: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(srcBlobPath);
    await blockBlobClient.downloadToFile(destFilePath);
  }
}
