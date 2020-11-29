import * as core from "@actions/core";
import * as azure from "@azure/storage-blob";
import { promises as fs } from "fs";
import path, * as Path from "path";
import { resolveContentType } from "./contenttype";
import * as files from "./files";

export interface AzureConnectionOptions {
  readonly connectionString: string;
  readonly containerName: string;
}

export interface AzureUploadDownloadOptions {
  readonly localDirectory: string;
  readonly blobDirectory?: string;
}

export interface AzureUploadOptions extends AzureUploadDownloadOptions {
  contentTypeHeaders?: azure.BlobHTTPHeaders;
}

export type AzureDownloadOptions = AzureUploadDownloadOptions

export class AzureBlobStorage {
  static async create(connectOptions: AzureConnectionOptions): Promise<AzureBlobStorage> {
    const blobServiceClient = azure.BlobServiceClient.fromConnectionString(connectOptions.connectionString);
    const containerClient = blobServiceClient.getContainerClient(connectOptions.containerName);

    if (!(await containerClient.exists())) {
      throw new Error(`The container ${connectOptions.containerName} does not exist.`);
    }

    return new AzureBlobStorage(connectOptions, containerClient);
  }

  constructor(private connectOptions: AzureConnectionOptions, private containerClient: azure.ContainerClient) {}

  async uploadFiles(uploadOptions: AzureUploadOptions): Promise<number> {
    const i = [0];
    await files.walkFiles(uploadOptions.localDirectory, async (filePath: string) => {
      await this.uploadFile(filePath, uploadOptions);
      ++i[0];
    });

    return i[0];
  }

  async downloadFiles(downloadOptions: AzureDownloadOptions): Promise<number> {
    const i: number[] = [0];

    await this.walkBlobs(async blob => {
      await this.downloadFile(blob.name, downloadOptions);
      ++i[0];
    });

    return i[0];
  }

  async walkBlobs(
    callback: (blob: azure.BlobItem) => Promise<void>,
    options: azure.ContainerListBlobsOptions = {},
  ): Promise<void> {
    for await (const response of this.containerClient.listBlobsFlat(options).byPage({ maxPageSize: 50 })) {
      for (const blob of response.segment.blobItems) {
        await callback(blob);
      }
    }
  }

  async uploadFile(filePath: string, uploadOptions: AzureUploadOptions): Promise<void> {
    core.info(`Uploading ${filePath}...`);
    let blobName = Path.relative(uploadOptions.localDirectory, filePath);

    if (uploadOptions.blobDirectory) {
      AzureBlobStorage.checkNotAbsolute(uploadOptions.blobDirectory);
      blobName = path.join(uploadOptions.blobDirectory, blobName);
    }

    blobName = blobName.replace(/\\/g, "/");

    const contentTypeHeaders = uploadOptions.contentTypeHeaders || {};

    if (!contentTypeHeaders.blobContentType) {
      contentTypeHeaders.blobContentType = resolveContentType(filePath) || undefined;
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadFile(filePath, { blobHTTPHeaders: contentTypeHeaders });
  }

  async downloadFile(blobName: string, downloadOptions: AzureDownloadOptions): Promise<void> {
    core.info(`Downloading ${blobName}...`);

    const destFilePath = AzureBlobStorage.computeDownloadDestFilePath(blobName, downloadOptions);

    await fs.mkdir(path.dirname(destFilePath), { recursive: true });

    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.downloadToFile(destFilePath);
  }

  static computeDownloadDestFilePath(blobName: string, downloadOptions: AzureDownloadOptions): string {
    let destFilePath = blobName;

    if (downloadOptions.blobDirectory) {
      AzureBlobStorage.checkNotAbsolute(downloadOptions.blobDirectory);
      destFilePath = path.relative(downloadOptions.blobDirectory, blobName);
    }

    return path.join(downloadOptions.localDirectory, destFilePath);
  }

  static checkNotAbsolute(blobName: string): void {
    if (path.isAbsolute(blobName)) {
      throw new Error(`The blobName ${blobName} cannot be an absolute path.`);
    }
  }
}
