import { OperationStatusType, Config } from './models';
import { BlobStorage, MongoDb } from '@azberry/az-simple';

export async function processBlobToJson(
  config: Config
): Promise<OperationStatusType> {
  const operationStorage: OperationStatusType = {
    name: 'clientBlobStorage.getJsonDataFromBlob',
    count: 0,
    data: undefined,
    status: 'success',
    statusCode: 0
  };

  if (
    !config.storageAccountName ||
    !config.storageAccountKey ||
    !config.storageAccountBlobUrl
  ) {
    operationStorage.status =
      'failure: storage blob - missing required configuration information';
    operationStorage.statusCode = 1;
    return operationStorage;
  }

  const clientBlobStorage = new BlobStorage(
    config.storageAccountName,
    config.storageAccountKey
  );
  const json = await clientBlobStorage.getJsonDataFromBlob(
    config.storageAccountBlobUrl
  );

  if (!json) {
    operationStorage.status = 'failure: storage blob - no data returned';
    operationStorage.statusCode = 1;
  } else if (!Array.isArray(json)) {
    operationStorage.status = "failure: storage blob - data isn't array";
    operationStorage.statusCode = 1;
  } else if (json.length === 0) {
    operationStorage.status = 'failure: storage blob - array has no length';
    operationStorage.statusCode = 1;
  } else {
    operationStorage.data = json;
    operationStorage.count = json.length;
    config.log.verbose(`${operationStorage.name}: ${operationStorage.count}`);
  }
  return operationStorage;
}
export async function processJsonToDb(
  config: Config,
  json
): Promise<OperationStatusType> {
  const operationDatabase: OperationStatusType = {
    name: 'clientMongoDb.uploadDocs',
    count: 0,
    data: undefined,
    status: 'success',
    statusCode: 0
  };

  if (
    !config.mongoDbConnectionString ||
    !config.mongoDbDatabaseName ||
    !config.mongoDbCollectionName
  ) {
    operationDatabase.status =
      'failure: database - missing required configuration information';
    operationDatabase.statusCode = 1;
    return operationDatabase;
  }

  const clientMongoDb = new MongoDb(config.mongoDbConnectionString);
  const insertResult = await clientMongoDb.uploadDocs(
    config.mongoDbDatabaseName,
    config.mongoDbCollectionName,
    json
  );

  operationDatabase.count = insertResult['insertedCount'];
  operationDatabase.data = insertResult;
  return operationDatabase;
}
export async function updateStatus(
  config: Config,
  { storageOp, databaseOp }
): Promise<OperationStatusType> {
  const operationDatabase: OperationStatusType = {
    name: 'clientMongoDb.updateStatus',
    count: 0,
    data: undefined,
    status: 'success',
    statusCode: 0
  };

  if (
    !config.mongoDbConnectionString ||
    !config.mongoDbDatabaseName ||
    !config.mongoDbCollectionName ||
    !config.storageAccountBlobUrl
  ) {
    operationDatabase.status =
      'failure: database update status - missing required configuration information';
    operationDatabase.statusCode = 1;
    return operationDatabase;
  }

  const clientMongoDb = new MongoDb(config.mongoDbConnectionString);
  const insertResult = await clientMongoDb.uploadDocs(
    config.mongoDbDatabaseName,
    `${config.mongoDbCollectionName}-status`,
    [
      {
        created: config.dateTime,
        blobUrl: config.storageAccountBlobUrl,
        storageSuccess: storageOp.statusCode,
        storageCount: storageOp.count,
        databaseSuccess: databaseOp.statusCode,
        databaseCount: databaseOp.count
      }
    ]
  );

  operationDatabase.count = insertResult['insertedCount'];
  operationDatabase.data = insertResult;
  return operationDatabase;
}
export async function processBlobToDb(
  config: Config
): Promise<Array<OperationStatusType>> {
  const processReturn: OperationStatusType[] = [];

  // Blob Storage
  const storageOp = await processBlobToJson(config);
  processReturn.push(storageOp);

  if (storageOp.statusCode === 1) {
    config.log.error(
      `processBlobToDb: processBlobToJson files: ${storageOp.status}`
    );
    return processReturn;
  }

  // Database
  const databaseOp = await processJsonToDb(config, storageOp.data);
  processReturn.push(databaseOp);

  if (databaseOp.statusCode !== 0) {
    return processReturn;
  }

  const dataaseOp2 = await updateStatus(config, { storageOp, databaseOp });
  processReturn.push(dataaseOp2);

  return processReturn;
}
