import { parseHttpHeaders } from "./main";


test("parseHttpHeaders", () => {

  const headers = parseHttpHeaders(`
    - glob: "**/*.js"
      headers:
        Cache-Control: public
        Content-Type: application/javascript

    - glob: "**/*"
      headers:
        Cache-Control: private

    - glob: 1
  `);

  expect(headers[0].glob).toBe("**/*.js");
  expect(headers[0].httpHeaders.blobCacheControl).toBe("public");
  expect(headers[0].httpHeaders.blobContentType).toBe("application/javascript");
  expect(headers[1].httpHeaders.blobCacheControl).toBe("private");
  expect(headers[1].httpHeaders.blobContentType).toBeUndefined();
  expect(headers[2].glob).toBe("1");
  expect(headers[2].httpHeaders.blobCacheControl).toBeUndefined();
});
