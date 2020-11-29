import * as fs from "fs";
import os from "os";
import path from "path";
import { AzureBlobStorage } from "./azure";

function loadParams() {
  const paramsFilename = path.join(os.homedir(), "ulaval", "ulaval.json");
  return JSON.parse(fs.readFileSync(paramsFilename, { encoding: "utf8" }));
}

const connectionString = process.env.CONNECTION_STRING || loadParams()["azure-blob-copy-action:connectionString"];

test("connection strings", async () => {
  await expect(AzureBlobStorage.create(connectionString, "tests123")).rejects.toThrow();

  await expect(AzureBlobStorage.create(connectionString, "tests")).resolves.toBeDefined();
});

test("uploadFile", async () => {
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
