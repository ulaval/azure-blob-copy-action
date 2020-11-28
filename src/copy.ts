import * as core from "@actions/core";
import { AzureBlobStorage } from "./azure";

export class CopyParameters {
  constructor(
    public action: string,
    public connectionString: string,
    public containerName: string,
    public localDirectory: string
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
  const destBlobStorage = await AzureBlobStorage.create(params.connectionString, params.containerName);
  const count = await destBlobStorage.uploadFiles(params.localDirectory);
  core.info(`Copied ${count} blobs successfully.`);
}

async function doDownload(params: CopyParameters): Promise<void> {
  core.info(`Downloading blobs to ${params.localDirectory} from the ${params.containerName} container...`);
  const destBlobStorage = await AzureBlobStorage.create(params.connectionString, params.containerName);
  const count = await destBlobStorage.downloadFiles(params.localDirectory);
  core.info(`Copied ${count} blobs successfully.`);
}

export async function copy(params: CopyParameters): Promise<void> {
  if (params.isUpload()) {
    await doUpload(params);
  } else {
    doDownload(params);
  }
}
