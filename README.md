# azure-blob-copy-action
Github action to allow copying to and from Azure Blob Storage

## Usage

```yaml
- name: Copy files
  uses: ulaval/azure-blob-copy-action@main
  with:
    action: upload
    connection_string: ${{ secrets.CONNECTION_STRING }}
    container_name: $web
    local_directory: dist
    http_headers: |
      - glob: "**/*.????????.*"
        headers:
          Cache-Control: public, max-age=604800, immutable

      - glob: "**/*"
        headers:
          Cache-Control: public, max-age=120, s-maxage=180, proxy-revalidate
```

## Inputs

| Name              | Required | Default        | Description                                                  |
| ----------------- | -------- | -------------- | ------------------------------------------------------------ |
| action            | yes      | upload         | 'upload' or 'download'. Determine whether the action should upload files to Azure or download files from Azure. |
| connection_string | yes      |                | Azure Blob Storage connection string to connect to Azure.    |
| container_name    | yes      |                | The Azure blob storage container name where to download/upload files. |
| blob_directory    | false    | Root folder    | The directory where to download/upload files inside the Azure container. |
| local_directory   | false    | Current folder | Local directory to copy from or to; this can either be an absolute path or a relative path. |
| http_headers      | false    |                | YAML document that allows setting http headers on blobs when uploading to Azure. Content-Type will be automatically deduced using mime-db. See below for examples. |



## http_headers

This input represents a YAML document linking a glob pattern to specific headers. The supported headers are:
- Cache-Control
- Content-Type
- Content-Encoding
- Content-Language
- Content-Disposition

The YAML document must resolve to an array where each element has a <glob> and <headers> values.

If a file is matched at multiple times, the first match wins.

By default, the Content-Type is discovered using mime-db mostly using UTF-8 charset.

For example:

```yaml
http_headers: |
  - glob: "**/*.js"
    headers:
      Cache-Control: public, max-age=604800, immutable
      Content-Type: application/javascript
      Content-Encoding: gzip
      Content-Language: fr-CA
      Content-Disposition: inline

  - glob: "**/*":
    headers:
      Cache-Control: public, no-cache
```
