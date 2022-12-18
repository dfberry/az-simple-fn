import { AzureFunction, Context } from '@azure/functions';

import { processBlobToDb } from '../shared/processBlob';
import {
  Config,
  ConfigProcessBlobType,
  ConfigDebugType,
  FunctionReturnsType
} from '../shared/models';

const blobTrigger: AzureFunction = async function (
  context: Context,
  myBlob: any
): Promise<void> {
  context.log(
    'Blob trigger function processed blob \n Name:',
    context.bindingData.name,
    '\n Blob Size:',
    myBlob.length,
    'Bytes'
  );

  const debugConfig: ConfigDebugType = {
    debug: !!process.env.DEBUG || false
  };
  const fnConfig: ConfigProcessBlobType = {
    storageAccountName: process.env.AZURE_BLOB_STORAGE_ACCOUNT_NAME,
    storageAccountKey: process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY,
    storageAccountBlobUrl: context.bindingData.uri,
    mongoDbConnectionString:
      process.env.AZURE_COSMOS_DB_MONGODB_CONNECTION_STRING,
    mongoDbDatabaseName: process.env.AZURE_COSMOS_DB_MONGODB_DATABASE_NAME,
    mongoDbCollectionName: process.env.AZURE_COSMOS_DB_MONGODB_COLLECTION_NAME
  };
  const config: Config = {
    dateTime: new Date().toUTCString(),
    log: context.log,
    ...debugConfig,
    ...fnConfig
  };

  const functionReturns: FunctionReturnsType = {
    status: 200,
    config,
    operations: [],
    errors: []
  };
  try {
    config.log.verbose(JSON.stringify(functionReturns.config));

    functionReturns.operations = await processBlobToDb(config);
    config.log.verbose(
      `process result operations count expected 2, received ${functionReturns.operations.length}`
    );

    if (!config.debug) {
      delete functionReturns.config;
      functionReturns.operations.map((operation) => delete operation.data);
    }
  } catch (err) {
    context.log(JSON.parse(JSON.stringify(err)));
    functionReturns.errors.push[JSON.parse(JSON.stringify(err))];
    functionReturns.status = 500;
  } finally {
    context.log(
      `BlobTrigger: ${fnConfig.mongoDbDatabaseName}/${
        fnConfig.mongoDbCollectionName
      }/${JSON.stringify(functionReturns)}`
    );
  }
};

export default blobTrigger;
