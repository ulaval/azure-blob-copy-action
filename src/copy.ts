import * as core from "@actions/core";
import * as azure from "./azure";

export class CopyParameters implements azure.AzureConnectionOptions,
                                       azure.AzureUploadOptions,
                                       azure.AzureDownloadOptions {
  constructor(
    public readonly action: string,
    public readonly connectionString: string,
    public readonly containerName: string,
    public readonly blobDirectory: string|undefined,
    public readonly localDirectory: string,
    public readonly httpHeaders?: azure.HttpHeadersOptions,
  ) {
    if (!(action === "upload" || action === "download")) {
      throw new Error("The action input is required and must be 'upload' or 'download'.");
    }

    if (!connectionString) {
      throw new Error("The connection_string input is required.");
    }

    if (!containerName) {
      throw new Error("The container_name input is required.");
    }

    if (!localDirectory) {
      throw new Error("The local_directory input is required.");
    }
  }

  isUpload(): boolean {
    return this.action === "upload";
  }
}

async function doUpload(params: CopyParameters): Promise<void> {
  core.info(`Uploading files from ${params.localDirectory} to the ${params.containerName} container...`);
  const azureBlobStorage = await azure.AzureBlobStorage.create(params);
  const count = await azureBlobStorage.uploadFiles(params);
  core.info(`Copied ${count} blobs successfully.`);
}

async function doDownload(params: CopyParameters): Promise<void> {
  core.info(`Downloading blobs to ${params.localDirectory} from the ${params.containerName} container...`);
  const azureBlobStorage = await azure.AzureBlobStorage.create(params);
  const count = await azureBlobStorage.downloadFiles(params);
  core.info(`Copied ${count} blobs successfully.`);
}

export async function copy(params: CopyParameters): Promise<void> {
  if (params.isUpload()) {
    await doUpload(params);
  } else {
    doDownload(params);
  }
}
