import { CopyParameters } from "./copy";

test("class CopyParameters", () => {
  expect(() => {
    new CopyParameters("xxx", "d", "c", "d");
  }).toThrow("The action input is required and must be 'upload' or 'download'.");

  expect(() => {
    new CopyParameters("upload", "", "c", "d");
  }).toThrow("The connection_string input is required.");

  expect(() => {
    new CopyParameters("upload", "d", "", "d");
  }).toThrow("The container_name input is required.");

  expect(() => {
    new CopyParameters("upload", "x", "x", "");
  }).toThrow("The local_directory input is required.");
});
