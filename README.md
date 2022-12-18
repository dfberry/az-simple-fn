# Process Blob Storage JSON files into Cosmos DB (MongoDB) collection

Features 

* Get Blob from Azure Blob Storage
* Read blob into JSON array
* Send JSON array to Azure Cosmos DB for MongoDB API

## Environment configuration

* local.settings.json or app settings

    ```
    "AZURE_BLOB_STORAGE_ACCOUNT_NAME":"",
    "AZURE_BLOB_STORAGE_ACCOUNT_KEY": "",
    "AZURE_COSMOS_DB_MONGODB_CONNECTION_STRING": "mongodb://...",
    "AZURE_COSMOS_DB_MONGODB_DATABASE_NAME": "",
    "AZURE_COSMOS_DB_MONGODB_COLLECTION_NAME": ""
    ```

* query string or request body

    - url is blob url to file of json array
    - collection is mongoDb collection name to bulk insert array of data into

    ```
    {
        "url":"https://YOUR-BLOB-STORAGE-ACCOUNT.blob.core.windows.net/container/directory/file.json","collection":"collectionName"
    }
    ```

## Success

If the function is successful and debug is false, function returns:  

```json
{
  "functionReturns": {
    "status": 200,
    "operations": [
      {
        "name": "clientBlobStorage.getJsonDataFromBlob",
        "count": 2111,
        "status": "success",
        "statusCode": 0
      },
      {
        "name": "clientMongoDb.uploadDocs",
        "count": 0,
        "status": "success",
        "statusCode": 0
      }
    ],
    "errors": []
  }
}
```