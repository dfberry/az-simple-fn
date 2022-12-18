# BlobTrigger - TypeScript

The `BlobTrigger` makes it incredibly easy to react to new Blobs inside of Azure Blob Storage. This sample demonstrates a simple use case of processing data from a given Blob using TypeScript.

## How it works

For a `BlobTrigger` to work, you provide a path which dictates where the blobs are located inside your container, and can also help restrict the types of blobs you wish to return. For instance, you can set the path to `samples/{name}.png` to restrict the trigger to only the samples path and only blobs with ".png" at the end of their name.

## Functionality

* Watch for new blobs into container
* Get blob url, refetch to get contents (see TBD), convert to JSON
* Insert into db for JSON
* Insert into db status table that file was processed

## TBD:

* Currents fetches blob from Azure Storage - since I already had that code. Need to read the incoming blob (buffer) and convert to JSON instead.

## Learn more

Required app settings for input binding:

* AZURE_BLOB_STORAGE_CONTAINER_PATH: this is the container and any subdirectorys (Gen 2) to watch for new blobs

Required app settings for function interior:

* DEBUG - Default to false. When true, adds config secrets, blob results, and database results
* AZURE_BLOB_STORAGE_ACCOUNT_NAME
* AZURE_BLOB_STORAGE_ACCOUNT_KEY
* AZURE_COSMOS_DB_MONGODB_CONNECTION_STRING
* AZURE_COSMOS_DB_MONGODB_DATABASE_NAME
* AZURE_COSMOS_DB_MONGODB_COLLECTION_NAME
