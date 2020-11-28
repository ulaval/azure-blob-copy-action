import * as core from "@actions/core";
import { copy, CopyParameters } from "./copy";

async function run(): Promise<void> {
  // Parameters from the developer in their GitHub Actions workflow
  const action = core.getInput("action", { required: true });
  const connectionString = core.getInput("connection_string", { required: true });
  const containerName = core.getInput("container_name", { required: true });
  const localDirectory = core.getInput("local_directory", { required: true });

  return copy(new CopyParameters(action, connectionString, containerName, localDirectory));
}

run().catch((e) => {
  core.debug(e.stack);
  core.error(e.message);
  core.setFailed(e.message);
});
