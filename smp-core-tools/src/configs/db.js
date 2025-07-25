import { Sequelize, Op } from 'sequelize';
import { appConfig, dbConfig } from './env.js';
import { logger } from './logger.js';
import fs from 'fs';

const { NODE_ENV } = process.env;
const isProductionLike = NODE_ENV === 'production' || NODE_ENV === 'staging';

const operatorsAliases = {
  _and: Op.and,
  _or: Op.or,
  _eq: Op.eq,
  _ne: Op.ne,
  _is: Op.is,
  _not: Op.not,
  _col: Op.col,
  _gt: Op.gt,
  _gte: Op.gte,
  _lt: Op.lt,
  _lte: Op.lte,
  _between: Op.between,
  _notBetween: Op.notBetween,
  _all: Op.all,
  _in: Op.in,
  _notIn: Op.notIn,
  _like: Op.like,
  _notLike: Op.notLike,
  _startsWith: Op.startsWith,
  _endsWith: Op.endsWith,
  _substring: Op.substring,
  _iLike: Op.iLike,
  _notILike: Op.notILike,
  _regexp: Op.regexp,
  _notRegexp: Op.notRegexp,
  _iRegexp: Op.iRegexp,
  _notIRegexp: Op.notIRegexp,
  _any: Op.any,
  _contains: Op.contains,
  _contained: Op.contained,
  _overlap: Op.overlap,
  _adjacent: Op.adjacent,
  _strictLeft: Op.strictLeft,
  _strictRight: Op.strictRight,
  _noExtendRight: Op.noExtendRight,
  _noExtendLeft: Op.noExtendLeft,
  _values: Op.values
};

// Fonction utilitaire pour lire les certificats si nécessaire
const getSSLConfig = () => {
  if (!isProductionLike) return undefined;

  const caPath = process.env.CA_PATH || 'ca.crt';
  const keyPath = process.env.KEY_PATH || 'tls.key';
  const certPath = process.env.CERT_PATH || 'tls.crt';

  try {
    return {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(caPath),
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    };
  } catch (err) {
    logger.error('[PostgreSQL] SSL configuration required but failed to load:', err.message);
    throw new Error('Missing or unreadable TLS certificates required for staging/production');
  }
};

const getSequelizeInstance = (overridePort = null) => {
  return new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, {
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: overridePort || dbConfig.port,
    logging: NODE_ENV !== 'dev' ? logger.info.bind(logger) : false,
    schema: dbConfig.schema,
    benchmark: true,
    retry: {
      max: 3,
      typeValidation: true
    },
    dialectOptions: getSSLConfig(),
    native: false,
    operatorsAliases
  });
};

let db = getSequelizeInstance();

db.connect = () => {
  const tryConnect = async (attempt = 0) => {
    try {
      await db.authenticate();
      logger.info(`${attempt}. Connection established to DB: ${db.options.host}:${db.options.port}`);
    } catch (error) {
      logger.error(`${attempt}. Unable to connect to DB at ${db.options.host}:${db.options.port}`, error);

      if (attempt === 0) {
        logger.warn('Retrying with default port 5432...');
        db = getSequelizeInstance(5432);
        return tryConnect(1);
      } else if (attempt === 1) {
        logger.warn('Retrying with original port and fallback options...');
        db = getSequelizeInstance();
        return tryConnect(2);
      } else {
        logger.error('Final attempt failed. Please verify your DB connection and TLS certificates.');
      }
    }
  };

  tryConnect();
};

export { db };
