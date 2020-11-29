import * as core from "@actions/core";
import yaml from "yaml";
import { GlobHttpHeaders, HttpHeadersOptions } from "./azure";
import { copy, CopyParameters } from "./copy";

function mapHttpHeaders(entry: {glob?: string, headers?: any}): GlobHttpHeaders {
  if (!entry.glob) {
    throw new Error("The glob is required");
  }

  if (!entry.headers) {
    return { glob: entry.glob.toString(), httpHeaders: {} };
  }

  return {
    glob: entry.glob.toString(),
    httpHeaders: {
      blobCacheControl: entry.headers["Cache-Control"],
      blobContentDisposition: entry.headers["Content-Disposition"],
      blobContentEncoding: entry.headers["Content-Encoding"],
      blobContentLanguage: entry.headers["Content-Language"],
      blobContentType: entry.headers["Content-Type"],
    } };
}

export function parseHttpHeaders(yamlInput: string): HttpHeadersOptions {
  core.info("http_headers: \n" + yamlInput);

  if (!yamlInput) {
    return [];
  }

  const parsedHttpHeaders = yaml.parse(yamlInput);

  if (!Array.isArray(parsedHttpHeaders)) {
    return [];
  }

  return parsedHttpHeaders.map(entry => mapHttpHeaders(entry));
}

async function run(): Promise<void> {
  const action = core.getInput("action", { required: true });
  const connectionString = core.getInput("connection_string", { required: true });
  const containerName = core.getInput("container_name", { required: true });
  const blobDirectory = core.getInput("blob_directory", { required: false });
  const localDirectory = core.getInput("local_directory", { required: true });
  const httpHeaders = parseHttpHeaders(core.getInput("http_headers", { required: false }));

  await copy(new CopyParameters(action, connectionString, containerName, blobDirectory, localDirectory, httpHeaders));
}

run().catch(e => {
  core.setFailed(e.message);
  core.debug(e.stack);
  core.error(e.message);
});
