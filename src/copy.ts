import * as core from "@actions/core";
import { AzureBlobStorage } from "./blobstorages/azure";
import { FilesService } from "./blobstorages/files";

export class CopyParameters {
  constructor(public src: string, public dest: string) {
    if (!src) {
      throw new Error("The src input is required.");
    }

    if (!dest) {
      throw new Error("The dest input is required.");
    }
  }
}

async function doUpload(params: CopyParameters): Promise<void> {
  const srcBlobStorage = await FilesService.create(params.src, "read");
  const destBlobStorage = await AzureBlobStorage.create(params.dest);

  let i = 0;
  await srcBlobStorage.walkFiles(async (path: string) => {
    await destBlobStorage.uploadFile(path);
    ++i;
  });

  core.info(`Copied ${i} blobs successfully.`);
}

export async function copy(params: CopyParameters): Promise<void> {
  await doUpload(params);
}
