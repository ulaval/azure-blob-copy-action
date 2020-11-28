import path from "path";
import { walkFiles } from "./files";

test("walkFiles", async () => {
  const files: string[] = [];
  await walkFiles(".", async (path) => {
    files.push(path);
  });

  expect(files).toContain("package.json");
  expect(files).toContain(path.join("dist", "index.js"));
});
