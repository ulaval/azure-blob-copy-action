import { BlobHTTPHeaders } from "@azure/storage-blob";
import mimeDb from "mime-db";
import * as mime from "mime-types";
import minimatch from "minimatch";
import { AzureUploadOptions } from "./azure";

// Adding utf-8 as default charset for text files
(mimeDb as any)["text/plain"]["charset"] = "UTF-8";

export function resolveContentType(filePath: string): string | undefined {
  return mime.contentType(filePath) || undefined;
}

function findHttpHeadersConfig(filePath: string, uploadOptions: AzureUploadOptions): BlobHTTPHeaders|undefined {

  for (const { glob, httpHeaders } of uploadOptions.httpHeaders!) {
    if (match(filePath, glob)) {
      return httpHeaders;
    }
  }

  return undefined;
}

export function match(blobName: string, pattern: string): boolean {
  return minimatch(blobName, pattern, { dot: true });
}

export function resolveHttpHeaders(filePath: string, uploadOptions: AzureUploadOptions): BlobHTTPHeaders {
  const httpHeaders: BlobHTTPHeaders = {};

  if (uploadOptions.httpHeaders) {
    const httpHeadersConfig = findHttpHeadersConfig(filePath, uploadOptions);

    if (httpHeadersConfig) {
      httpHeaders.blobCacheControl = httpHeadersConfig.blobCacheControl;
      httpHeaders.blobContentDisposition = httpHeadersConfig.blobContentDisposition;
      httpHeaders.blobContentEncoding = httpHeadersConfig.blobContentEncoding;
      httpHeaders.blobContentLanguage = httpHeadersConfig.blobContentLanguage;
      httpHeaders.blobContentType = httpHeadersConfig.blobContentType;
    }
  }

  if (!httpHeaders.blobContentType) {
    httpHeaders.blobContentType = resolveContentType(filePath);
  }

  return httpHeaders;
}
