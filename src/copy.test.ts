import { CopyParameters } from "./copy";

test("class CopyParameters", () => {
  expect(() => {
    new CopyParameters("", "d", "c");
  }).toThrow();

  expect(() => {
    new CopyParameters("s", "", "c");
  }).toThrow();

  expect(() => {
    new CopyParameters("s", "d", "");
  }).toThrow();
});
