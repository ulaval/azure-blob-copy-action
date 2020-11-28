import { constants as FsConstants, promises as Fs } from "fs";
import * as Path from "path";

export class FilesService {
  static async create(rootPath: string, mode: "read" | "write"): Promise<FilesService> {
    rootPath = Path.resolve(rootPath);
    await Fs.access(rootPath, mode == "read" ? FsConstants.R_OK : FsConstants.R_OK | FsConstants.W_OK);
    return new FilesService(rootPath);
  }

  constructor(private rootpath: string) {}

  async walkFiles(callback: (path: string) => Promise<void>): Promise<void> {
    async function _walk(dir: string): Promise<void> {
      const files = await Fs.readdir(dir);

      for (const file of files) {
        const path = Path.join(dir, file);
        const stat = await Fs.lstat(path);

        if (stat.isDirectory()) {
          await _walk(path);
        } else {
          callback(path);
        }
      }
    }

    await _walk(this.rootpath);
  }
}
