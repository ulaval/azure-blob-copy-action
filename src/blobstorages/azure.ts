
export class Blob {

}

export class AzureBlobStorage {
  static async create(connectionString: string): Promise<AzureBlobStorage> {
    return new AzureBlobStorage();
  }

  async uploadFile(path: string): Promise<void> {

  }
}
