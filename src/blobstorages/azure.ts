export class Blob {}

export class AzureBlobStorage {
  static async create(_connectionString: string): Promise<AzureBlobStorage> {
    return new AzureBlobStorage();
  }

  async uploadFile(_path: string): Promise<void> {
    // TODO
  }
}
