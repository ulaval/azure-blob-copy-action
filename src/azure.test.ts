import * as fs from "fs";
import os from "os";
import path from "path";
import { AzureBlobStorage } from "./azure";
import { walkFiles } from "./files";

function loadParams() {
  const paramsFilename = path.join(os.homedir(), "ulaval", "ulaval.json");
  return JSON.parse(fs.readFileSync(paramsFilename, { encoding: "utf8" }));
}

const connectionString = process.env.CONNECTION_STRING || loadParams()["azure-blob-copy-action:connectionString"];

test("connection strings", async () => {
  await expect(AzureBlobStorage.create(connectionString, "tests123")).rejects.toThrow();

  await expect(AzureBlobStorage.create(connectionString, "tests")).resolves.toBeDefined();
});

test("upload download file", async () => {
  const azureBlobStorage = await AzureBlobStorage.create(connectionString, "tests");

  const folderPath = path.join("dist", "tests");
  const filePath = path.join(folderPath, "uploadFile.txt");
  const destPath = path.join(folderPath, "uploadFile2.txt");

  if (fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  } else {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  fs.writeFileSync(filePath, "Allo", { encoding: "utf8" });

  await azureBlobStorage.uploadFile(folderPath, filePath);
  await azureBlobStorage.downloadFile("uploadFile.txt", destPath);

  expect(fs.readFileSync(destPath, { encoding: "utf8" })).toBe("Allo");
});

test("walkBlobs", async () => {
  const azureBlobStorage = await AzureBlobStorage.create(connectionString, "tests");

  await azureBlobStorage.walkBlobs(async _blob => {
    // TODO
  });
});

test("upload download files", async () => {
  const downloadedPath = path.join("dist", "tests", "downloaded");

  const azureBlobStorage = await AzureBlobStorage.create(connectionString, "tests");

  const countUploaded = await azureBlobStorage.uploadFiles(".github");

  expect(countUploaded).toBeGreaterThan(0);

  const countDownloaded = await azureBlobStorage.downloadFiles(downloadedPath);

  const i = [0];
  await walkFiles(downloadedPath, async () => {
    i[0] += 1;
  });

  expect(countDownloaded).toBe(i[0]);
  expect(countDownloaded).toBeGreaterThanOrEqual(countUploaded);
});
