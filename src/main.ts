import * as core from "@actions/core";
import { copy, CopyParameters } from "./copy";

async function run(): Promise<void> {
  const action = core.getInput("action", { required: true });
  const connectionString = core.getInput("connection_string", { required: true });
  const containerName = core.getInput("container_name", { required: true });
  const localDirectory = core.getInput("local_directory", { required: true });

  await copy(new CopyParameters(action, connectionString, containerName, localDirectory));
}

run().catch((e) => {
  core.setFailed(e.message);
  core.debug(e.stack);
  core.error(e.message);
});
