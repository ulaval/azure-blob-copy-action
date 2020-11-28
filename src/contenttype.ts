import mimeDb from "mime-db";
import * as mime from "mime-types";

(mimeDb as any)["text/plain"]["charset"] = "UTF-8";

export function resolveContentType(filePath: string): string | undefined {
  return mime.contentType(filePath) || undefined;
}
