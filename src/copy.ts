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
  const destBlobStorage = await AzureBlobStorage.create(params.connectionString, params.containerName);
  const count = destBlobStorage.uploadFiles(params.localDirectory);
  core.info(`Copied ${count} blobs successfully.`);
}

export async function copy(params: CopyParameters): Promise<void> {
  if (params.isUpload()) {
    return await doUpload(params);
  }

  throw new Error("Download is not yet supported.");
}
