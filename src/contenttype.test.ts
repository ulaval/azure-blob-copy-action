import { resolveContentType } from "./contenttype";

test("resolveContentType", () => {
  expect(resolveContentType("test.txt")).toBe("text/plain; charset=utf-8");
  expect(resolveContentType("test.css")).toBe("text/css; charset=utf-8");
  expect(resolveContentType("test.html")).toBe("text/html; charset=utf-8");
  expect(resolveContentType("test.js")).toBe("application/javascript; charset=utf-8");
  expect(resolveContentType("test.js.map")).toBe("application/json; charset=utf-8");
  expect(resolveContentType("test.json")).toBe("application/json; charset=utf-8");
  expect(resolveContentType("test.ico")).toBe("image/vnd.microsoft.icon");
});
