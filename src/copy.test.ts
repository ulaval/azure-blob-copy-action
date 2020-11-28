import { CopyParameters } from "./copy";

test('class CopyParameters', () => {
  expect(() => {new CopyParameters("", "test")}).toThrow();
  expect(() => {new CopyParameters("test", "")}).toThrow();
});
