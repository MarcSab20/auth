// src/configs/infraConfig.js
import fs from 'node:fs';
const secretPath = (new String(process.env.SMP_ROOT_SECRETS_FOLDER ?? '../run/secrets/')).toString();
const databaseUsed = (new String(process.env.SMP_MAIN_DATABASE_USED ?? 'postgresql')).toString();

const acces_token_max_duration = 86400000 // 60*60*24 => 24h in second
const refresh_token_max_duration = 259200000 // 60*60 * 24 * 30 => 30d ~ 1 month

var env;
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'develop'
  || process.env.NODE_ENV === 'development'
  || process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'd') {
  env = 'dev'
} else if (process.env.NODE_ENV === 'int'
  || process.env.NODE_ENV === 'i' || process.env.NODE_ENV === 'integ'
  || process.env.NODE_ENV === 'integration') { 
    env = 'int'
} else if (process.env.NODE_ENV === 'local'
  || process.env.NODE_ENV === 'l' || process.env.NODE_ENV === 'loc'
  || process.env.NODE_ENV === 'local') {
  env = 'local'
} else if (process.env.NODE_ENV === 'prod'
  || process.env.NODE_ENV === 'i' || process.env.NODE_ENV === 'produc'
  || process.env.NODE_ENV === 'integration') {
  env = 'prod'
} else {
  env = process.env.NODE_ENV
}

const isDevelopmentEnv = (env === 'dev' || env === 'local')
const isProductionEnv = (env === 'prod' || env === 'int')
const debug = process.env.NODE_DEBUG || "info"
const instanceSerial = process.env.SMP_MU_SERVICE_INSTANCE_SERIAL || 1

const smp_user_password_secret_salt = process.env.SMP_USER_PASSWORD_SECRET ;
const smp_user_jwt_secret_salt = process.env.SMP_USER_JWT_SECRET ;
const smp_user_access_secret_salt = process.env.SMP_USER_JWT_ACCESS_SECRET || smp_user_jwt_secret_salt;
const smp_user_refresh_secret_salt = process.env.SMP_USER_JWT_REFRESH_SECRET || smp_user_access_secret_salt;

const smp_app_jwt_secret_salt = process.env.SMP_APP_JWT_SECRET ; 
const smp_app_access_secret_salt = process.env.SMP_APP_JWT_ACCESS_SECRET || smp_app_jwt_secret_salt ; 
const smp_app_refresh_secret_salt = process.env.SMP_APP_JWT_REFRESH_SECRET || smp_app_access_secret_salt ; 

const smp_user_jwt_access_token_duration = process.env.SMP_USER_ACCESS_TOKEN_DURATION ;
const smp_user_jwt_refresh_token_duration = process.env.SMP_USER_REFRESH_TOKEN_DURATION ;
const smp_app_jwt_access_token_duration = process.env.SMP_APP_ACCESS_TOKEN_DURATION ;
const smp_app_jwt_refresh_token_duration = process.env.SMP_APP_REFRESH_TOKEN_DURATION ;

/**
 * 
 * @param {string} debug
 * @returns {number}
 * @description Compute the verbosity level of the application
 * @example 
 * computeVerbosityLevel('debug') // returns 1
 * computeVerbosityLevel('verbose') // returns 2
 * computeVerbosityLevel('info') // returns 3
 * computeVerbosityLevel('io') // returns 4
 * computeVerbosityLevel('warnning') // returns 5
 * computeVerbosityLevel('error') // returns 6
 * computeVerbosityLevel('unknown') // returns 7
 * computeVerbosityLevel() // returns 7
 */

function computeVerbosityLevel(debug) {
  // Verbose level 0 means debug mode is on so give everything we got (silly mode)
  let verboseLevel = 0;
  switch (debug) {
    case 'd', 'debug':
      verboseLevel = 1;
      break;
    case 'v', 'verbose':
      verboseLevel = 2;
      break;
    case 'i', 'info':
      verboseLevel = 3;
      break;
    case 'io', 'http', 'file':
      verboseLevel = 4;
      break;
    case 'w', 'warn', 'warnning', 'warning':
      verboseLevel = 5;
      break;
    case 'e', 'err', 'error':
      verboseLevel = 6;
      break;
    default:
      verboseLevel = 7;
      break;
  }
}
//
// gRPC Config Object
const gRPCConfig = {
  host: process.env.GRPC_HOST || '0.0.0.0',
  port: parseInt(`${process.env.GRPC_PORT || 50051}`, 10)
}

let freezeTableDB = 'true'
let hostDB
let nameDB
let paranoidDB
let portDB
let pswdDB
let schemaDB
let syncDB
let timestampDB
let usernameDB
// 
// We have to check if the file exists before reading it
if (databaseUsed) {
  // freezeTableDB = fs.readFileSync(secretPath + "db_freezed_table_name", 'utf8').trim();
  let db_user_file = (new String(process.env.DATABASE_USER_FILE)).toString();
  let db_host_file = (new String(process.env.DATABASE_HOST_FILE)).toString();
  let db_port_file = (new String(process.env.DATABASE_PORT_FILE)).toString();
  let db_pswd_file = (new String(process.env.DATABASE_PASSWORD_FILE)).toString();
  let db_database_file = (new String(process.env.DATABASE_DB_FILE)).toString();
  let db_timestamp_file = secretPath + "db_timestamp";
  let db_paranoid_file = secretPath + "db_paranoid";
  let db_schema_file = secretPath + "db_schema";
  let db_sync_file = secretPath + "db_sync";
  
  let stats;
  try {
    stats = fs.statSync(secretPath);
  } catch (err) {
    console.warn(err);
  }

  // Check if the path is a directory.
  if (stats && stats.isDirectory()) {
    console.log('Path to secret exists');
    if (db_user_file && fs.existsSync(db_user_file)) { 
      usernameDB = fs.readFileSync(db_user_file, 'utf8', (err, data) => {
        if (!err && data) {
          console.log('usernameDB: ', data.trim());
        } else {
          console.error("Path to file ", db_user_file, " doesn't exists");
        }
      }).trim();
    } else {
      console.error('db_user_file doesn\'t exists');
    }
    // We have to check if the file exists before reading it
    if (db_host_file && fs.existsSync(db_host_file)) {
      hostDB = fs.readFileSync(db_host_file, 'utf8', (err, data) => {
        if (!err && data) {
          console.log('hostDB: ', data.trim());
        } else {
          console.error("Path to file ", db_host_file, " doesn't exists");
        }
      }).trim();
    } else {
      console.error('db_host_file doesn\'t exists : ' + db_host_file);
    }
    // We have to check if the file exists before reading it
    if (db_port_file !== undefined && fs.existsSync(db_port_file)) {
      portDB = fs.readFileSync(db_port_file, 'utf8', (err, data) => {
        if (!err && data) {
          console.log('portDB: ', data.trim());
        } else {
          console.error("Path to file ", db_port_file, " doesn't exists");
        }
      }).trim();
    } else {
      console.error('db_port_file doesn\'t exists : ' + db_port_file);
    }
    if (db_pswd_file !== undefined && fs.existsSync(db_pswd_file)) {

      pswdDB = fs.readFileSync(db_pswd_file, 'utf8', (err, data) => {

        if (!err && data) {
          console.log('pswdDB: ', data.trim());
        } else {
          console.error("Path to file ", db_pswd_file, " doesn't exists");
        }
      }).trim();
    } else {
      console.error('db_pswd_file doesn\'t exists : ' + db_pswd_file);
    }
    if (db_database_file !== undefined && fs.existsSync(db_database_file)) {
      nameDB = fs.readFileSync(db_database_file, 'utf8', (err, data) => {
        if (!err && data) {
          console.log('nameDB: ', data.trim());
        } else {
          console.error("Path to file ", db_database_file, " doesn't exists");
        }
      }).trim();
    } else {
      console.error('db_database_file doesn\'t exists : ' + db_database_file);
    }
    if (db_timestamp_file !== undefined && fs.existsSync(db_timestamp_file)) {
      timestampDB = fs.readFileSync(db_timestamp_file, 'utf8', (err, data) => {
        if (!err && data) {
          console.log('timestampDB: ', data.trim());
        } else {
          console.error("Path to file ", db_timestamp_file, " doesn't exists");
        }
      }).trim();
    } else {
      console.error('db_timestamp_file doesn\'t exists : ' + db_timestamp_file);
    }
    if (db_paranoid_file !== undefined && fs.existsSync(db_paranoid_file)) {
      paranoidDB = fs.readFileSync(db_paranoid_file, 'utf8', (err, data) => {
        if (!err && data) {
          console.log('paranoidDB: ', data.trim());
        } else {
          console.error("Path to file ", db_paranoid_file, " doesn't exists");
        }
      }).trim();
    } else {
      console.error('db_paranoid_file doesn\'t exists : ' + db_paranoid_file);
    }
    if (db_schema_file !== undefined && fs.existsSync(db_schema_file)) {
      schemaDB = fs.readFileSync(db_schema_file, 'utf8', (err, data) => {
        if (!err && data) {
          console.log('schemaDB: ', data.trim());
        } else {
          console.error("Path to file ", db_schema_file, " doesn't exists");
        }
      }).trim();
    }
    if (db_sync_file !== undefined && fs.existsSync(db_sync_file)) {
      syncDB = fs.readFile(db_sync_file, 'utf8', (err, data) => {
        if (!err && data) {
          console.log('syncDB: ', data.trim());
        } else {
          console.warn("Path to file ", db_sync_file, " doesn't exists");
        }
      });
    }
  } else {
    console.warn("Unable to read secret files from the env module : ", secretPath, " doesn't exist.")
    console.warn("HOPE WE ARE IN DEVELOPMENT ENVIRONMENET")
  }
}


const dbConfig = {
  dialect: 'postgres',
  host: process.env.DB_HOST || (hostDB ?? 'localhost'),
  port: parseInt(`${process.env.DB_PORT || (portDB ?? 5432)}`, 10),
  user: process.env.DB_USERNAME || (usernameDB ?? 'services_bb_uspace_db_u'),
  password: process.env.DB_PASSWORD || (pswdDB ?? 'bb_uspace_db_u_pswd'),
  name: process.env.DB_DATABASE || (nameDB ?? 'services_uspace_db'),
  schema: process.env.DB_SCHEMA || (schemaDB ?? 'public'),
  sync: process.env.DB_SYNC === (syncDB ?? 'true'),
  paranoid: paranoidDB ?? true,
  timestamp: timestampDB ?? true,
  freezeTableName: freezeTableDB ?? true,
  underscored: false
}
//
// Cache System Config Object
//
const cacheConfig = {
  host: process.env.SMP_MU_REDIS_HOSTNAME ?? (process.env.REDIS_HOST || 'localhost'),
  port: parseInt(`${process.env.SMP_MU_REDIS_PORT  ?? (process.env.REDIS_PORT || '6379')}`, 10),
  username: process.env.SMP_MU_REDIS_USER ?? ( process.env.REDIS_USER ||"admin"),
  password: process.env.SMP_MU_REDIS_PASSWORD ?? (process.env.REDIS_PASSWORD|| undefined),
}

//
// App Config Object
//
const tagFormationSep = ":"
const serviceFullName = process.env.SMP_MU_SERVICE_NAME ?? "Unkown";

const providedServiceVersion = 'v1';
const providedServiceType = 'API';
const componentName = process.env.SMP_MU_SERVICE_NAME ?? "Unkown"
const componentGroupTrigram = "smp"
const componentType = "µ-service" // could be a worker, job, batch, deamon, service, and so on
const componentShortName = process.env.SMP_MU_SERVICE_SHORTNAME ?? "unkm"
const serviceFullTag = componentGroupTrigram + tagFormationSep + componentType + tagFormationSep + componentShortName
const requestServerSpelling = serviceFullName + " " + providedServiceType + " " + providedServiceVersion;

const appConfig = {
  envExc: env,
  isDevelopmentEnv: isDevelopmentEnv,
  isProductionEnv: isProductionEnv,
  domain: process.env.SMP_MU_DOMAIN_NAME ?? "services.ceo",
  apiPort: process.env.SMP_MU_SERVICE_API_PORT ?? 4000,
  verbose: debug,
  version: providedServiceVersion,
  componentType: componentType,
  componentGroup: componentGroupTrigram,
  componentName: componentName,
  componentShortName: componentShortName,
  componentTag: serviceFullTag,
  // Salt information for AuthN
  userPasswordSalt: smp_user_password_secret_salt || 12,
  userJWTSecretSalt: smp_user_jwt_secret_salt || "",
  userAccessTokenSalt: smp_user_access_secret_salt || "",
  userRefreshTokenSalt: smp_user_refresh_secret_salt || "",
  appJWTSecretSalt: smp_app_jwt_secret_salt || "", 
  appAccessTokenSalt: smp_app_access_secret_salt || "" ,
  appRefreshTokenSalt: smp_app_refresh_secret_salt || "" ,
 
  // Duration information for AuthN
  sensitiveCachedDataDuration: process.env.SMP_MU_SENSITIVE_CACHED_DATA_DURATION || acces_token_max_duration,
  userAccessTokenDuration: smp_user_jwt_access_token_duration || acces_token_max_duration,
  appAccessTokenDuration: smp_app_jwt_access_token_duration || acces_token_max_duration ,
  userRefreshTokenDuration: smp_user_jwt_refresh_token_duration || refresh_token_max_duration, 
  appRefreshTokenDuration: smp_app_jwt_refresh_token_duration || refresh_token_max_duration,
  userAccessTokenMaxDuration: acces_token_max_duration,
  userRefreshTokenMaxDuration: refresh_token_max_duration,
  appAccessTokenMaxDuration: acces_token_max_duration,
  appRefreshTokenMaxDuration: refresh_token_max_duration,

  componentInstanceSerial: instanceSerial,
  verboseLevel: computeVerbosityLevel(debug),
  defaultCurrencyDevice: process.env.APP_DEFAULT_CURRENCY_DEVICE || "EUR",
  defaultXGraphqlServerName: process.env.APP_DEFAULT_X_GRAPHQL_SERVER || requestServerSpelling,
  defaultXAppAPITitleName: process.env.APP_DEFAULT_X_APP_API_TITLE_NAME || 'x-services-app-name',
  defaultXAppAPIIdName: process.env.APP_DEFAULT_X_APP_API_ID_NAME || 'x-services-app-id',
  defaultXAppAPITokenName: process.env.APP_DEFAULT_X_APP_API_TOKEN_NAME || 'x-services-app-token',
  defaultXAppAPIKeyName: process.env.APP_DEFAULT_X_APP_API_KEY_NAME || 'x-services-app-key',
  defaultXAppRequestIDKeyName: process.env.APP_DEFAULT_X_APP_REQUEST_ID_KEY_NAME || 'x-services-request-id',
  defaultXApplicationStructure: process.env.APP_DEFAULT_X_APPLICATION_STRUCTURE || 'x-services-application',
}

const rabbitMQConfig = {
  port: process.env.RABBITMQ_PORT ?? 5672,
  url: process.env.RABBITMQ_URL,
  exchange: process.env.RABBITMQ_EXCHANGE,
  exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE,
};

export { appConfig, gRPCConfig, dbConfig, cacheConfig, isDevelopmentEnv, isProductionEnv, rabbitMQConfig};