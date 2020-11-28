import * as core from "@actions/core";
import { AzureBlobStorage } from "./azure";

export class CopyParameters {
  constructor(public src: string, public dest: string, public container: string) {
    if (!src) {
      throw new Error("The src input is required.");
    }

    if (!dest) {
      throw new Error("The dest input is required.");
    }

    if (!container) {
      throw new Error("The container input is required.");
    }
  }
}

async function doUpload(params: CopyParameters): Promise<void> {
  const destBlobStorage = await AzureBlobStorage.create(params.dest, params.container);
  const count = destBlobStorage.uploadFiles(params.src);
  core.info(`Copied ${count} blobs successfully.`);
}

export async function copy(params: CopyParameters): Promise<void> {
  await doUpload(params);
}
