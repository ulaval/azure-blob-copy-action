import { HttpHeadersOptions } from "./azure";
import { match, resolveContentType, resolveHttpHeaders } from "./httpheaders";

test("resolveContentType", () => {
  expect(resolveContentType("test.txt")).toBe("text/plain; charset=utf-8");
  expect(resolveContentType("test.css")).toBe("text/css; charset=utf-8");
  expect(resolveContentType("test.html")).toBe("text/html; charset=utf-8");
  expect(resolveContentType("test.js")).toBe("application/javascript; charset=utf-8");
  expect(resolveContentType("test.js.map")).toBe("application/json; charset=utf-8");
  expect(resolveContentType("test.json")).toBe("application/json; charset=utf-8");
  expect(resolveContentType("test.ico")).toBe("image/vnd.microsoft.icon");
  expect(resolveContentType("test.yml")).toBe("text/yaml; charset=utf-8");
});

test("resolveHttpHeaders", () => {
  const resolve = function (httpHeaders?: HttpHeadersOptions) {
    return resolveHttpHeaders("folder1/test.js", { localDirectory: ".", httpHeaders });
  };

  expect(resolve().blobCacheControl).toBeUndefined();
  expect(resolve([]).blobCacheControl).toBeUndefined();
  expect(resolve([{ glob: "**/*.ts", httpHeaders: { blobCacheControl: "public" } }]).blobCacheControl).toBeUndefined();
  expect(resolve([{ glob: "**/*.js", httpHeaders: { blobCacheControl: "public" } }]).blobCacheControl).toBe("public");
});

test("minimatch", () => {
  expect(match("folder1/test.js", "**/*.js")).toBe(true);
  expect(match("folder1/test.123456.js", "**/*.??????.js")).toBe(true);
  expect(match("folder1/test.js", "**/*.+(ts|js)")).toBe(true);
  expect(match("folder1/test.js", "!**/*.js")).toBe(false);
  expect(match("folder1/test.js", "{**/*.ts,**/*.js}")).toBe(true);
});
