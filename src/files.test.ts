import path from "path";
import { FilesService } from "./files";

test("walkFiles", async () => {
  const blobStorage = await FilesService.create(".", "read");

  const files: string[] = [];
  await blobStorage.walkFiles(async (path) => {
    files.push(path);
  });

  expect(files).toContain("package.json");
  expect(files).toContain(path.join("dist", "index.js"));
});