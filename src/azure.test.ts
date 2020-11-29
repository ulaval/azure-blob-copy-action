import * as fs from "fs";
import os from "os";
import path from "path";
import { AzureBlobStorage, AzureConnectionOptions } from "./azure";
import { walkFiles } from "./files";

function loadParams() {
  const paramsFilename = path.join(os.homedir(), "ulaval", "ulaval.json");
  return JSON.parse(fs.readFileSync(paramsFilename, { encoding: "utf8" }));
}

const connectionString = process.env.CONNECTION_STRING || loadParams()["azure-blob-copy-action:connectionString"];
const connectOptions: AzureConnectionOptions = { connectionString, containerName: "tests" };

test("connection strings", async () => {
  await expect(AzureBlobStorage.create({ connectionString, containerName: "xxx" })).rejects.toThrow();
  await expect(AzureBlobStorage.create(connectOptions)).resolves.toBeDefined();
});

test("upload download file", async () => {
  const azureBlobStorage = await AzureBlobStorage.create(connectOptions);

  const uploadDirectory = path.join("dist", "tests", "upload");
  const uploadFilePath = path.join(uploadDirectory, "uploadFile.txt");

  const downloadDirectory = path.join("dist", "tests", "download");
  const downloadDirectory2 = path.join("dist", "tests", "download2");
  const downloadFilePath = path.join(downloadDirectory, "uploadFile.txt");
  const downloadFilePath2 = path.join(downloadDirectory2, "uploadFile.txt");

  if (fs.existsSync(downloadFilePath)) {
    fs.unlinkSync(downloadFilePath);
  }

  if (fs.existsSync(downloadFilePath2)) {
    fs.unlinkSync(downloadFilePath2);
  }

  fs.mkdirSync(uploadDirectory, { recursive: true });
  fs.writeFileSync(uploadFilePath, "Allo", { encoding: "utf8" });

  await azureBlobStorage.uploadFile(uploadFilePath, { localDirectory: uploadDirectory });
  await azureBlobStorage.uploadFile(uploadFilePath, { localDirectory: uploadDirectory, blobDirectory: "subdirectory" });

  await azureBlobStorage.downloadFile("uploadFile.txt", { localDirectory: downloadDirectory });
  await azureBlobStorage.downloadFile("uploadFile.txt", { localDirectory: downloadDirectory2 });

  expect(fs.readFileSync(downloadFilePath, { encoding: "utf8" })).toBe("Allo");
  expect(fs.readFileSync(downloadFilePath2, { encoding: "utf8" })).toBe("Allo");
});

test("walkBlobs", async () => {
  const azureBlobStorage = await AzureBlobStorage.create(connectOptions);

  const count = [0];
  await azureBlobStorage.walkBlobs(async _blob => {
    ++count[0];
  });

  expect(count[0]).toBeGreaterThan(0);
});

test("upload download files", async () => {
  const downloadedPath = path.join("dist", "tests", "downloaded");

  const azureBlobStorage = await AzureBlobStorage.create(connectOptions);

  const countUploaded = await azureBlobStorage.uploadFiles({ localDirectory: ".github" });

  expect(countUploaded).toBeGreaterThan(0);

  const countDownloaded = await azureBlobStorage.downloadFiles({ localDirectory: downloadedPath });

  const i = [0];
  await walkFiles(downloadedPath, async () => {
    i[0] += 1;
  });

  expect(countDownloaded).toBe(i[0]);
  expect(countDownloaded).toBeGreaterThanOrEqual(countUploaded);
});

test("computeDownloadDestFilePath", () => {
  const dest1 = AzureBlobStorage.computeDownloadDestFilePath("folder1/folder2/myfile.txt", { localDirectory: "." });
  const dest2 = AzureBlobStorage.computeDownloadDestFilePath("folder1/folder2/myfile.txt",
    { localDirectory: "dist", blobDirectory: "folder1" });

  expect(dest1).toBe(path.join("folder1", "folder2", "myfile.txt"));
  expect(dest2).toBe(path.join("dist", "folder2", "myfile.txt"));
  expect(() => {
    AzureBlobStorage.computeDownloadDestFilePath("/folder1/folder2/myfile.txt",
      { localDirectory: "dist", blobDirectory: "/folder1" });
  }).toThrow("The blobName /folder1 cannot be an absolute path.");
});
