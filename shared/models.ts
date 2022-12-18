import { Context } from '@azure/functions';

export type ConfigBase = {
  dateTime: string;
};

export type ConfigDebugType = {
  debug: boolean;
};

export type ConfigProcessBlobType = {
  storageAccountName: string;
  storageAccountKey: string;
  storageAccountBlobUrl: string;
  mongoDbConnectionString: string;
  mongoDbDatabaseName: string;
  mongoDbCollectionName: string;
};
export type Config = ConfigBase &
  ConfigDebugType &
  ConfigProcessBlobType &
  Pick<Context, 'log'>;

export type OperationStatusTextType =
  | 'success'
  | 'failure: storage blob - no data returned'
  | "failure: storage blob - data isn't array"
  | 'failure: storage blob - array has no length'
  | 'failure: storage blob - missing required configuration information'
  | 'failure: database - missing required configuration information'
  | 'failure: database update status - missing required configuration information';

export type OperationStatusType = {
  name: string;
  count: number;
  data: unknown;
  status: OperationStatusTextType;
  statusCode: number;
};
export type FunctionReturnsType = {
  status: number;
  config: Config;
  operations: OperationStatusType[];
  errors: unknown[];
};
