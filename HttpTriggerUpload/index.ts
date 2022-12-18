import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { processBlobToDb } from '../shared/processBlob';
import {
  Config,
  ConfigProcessBlobType,
  ConfigDebugType,
  FunctionReturnsType
} from '../shared/models';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const debugConfig: ConfigDebugType = {
    debug: process.env.DEBUG || req.query.debug || req.body.debug || false
  };

  const fnConfig: ConfigProcessBlobType = {
    storageAccountName: process.env.AZURE_BLOB_STORAGE_ACCOUNT_NAME,
    storageAccountKey: process.env.AZURE_BLOB_STORAGE_ACCOUNT_KEY,
    storageAccountBlobUrl: req.query.url || (req.body && req.body.url),
    mongoDbConnectionString:
      process.env.AZURE_COSMOS_DB_MONGODB_CONNECTION_STRING,
    mongoDbDatabaseName: process.env.AZURE_COSMOS_DB_MONGODB_DATABASE_NAME,
    mongoDbCollectionName:
      req.query.collection || (req.body && req.body.collection)
  };

  const config: Config = {
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
    context.res = {
      status: functionReturns.status,
      body: { functionReturns }
    };
  }
};

export default httpTrigger;
