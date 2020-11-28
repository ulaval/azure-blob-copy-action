import * as core from "@actions/core";
import { copy, CopyParameters } from "./copy";

async function run(): Promise<void> {
  // Parameters from the developer in their GitHub Actions workflow
  const src = core.getInput("src", { required: true });
  const dest = core.getInput("dest", { required: true });
  const container = core.getInput("container", { required: true });

  return copy(new CopyParameters(src, dest, container));
}

run().catch((e) => {
  core.debug(e.stack);
  core.error(e.message);
  core.setFailed(e.message);
});
