// src/configs/cache.js
import redis from 'redis';
import fs from 'fs';
import { promisify } from 'util';
import { appConfig, cacheConfig } from './env.js';
import { logger } from './logger.js';

const { NODE_ENV } = process.env;
const useTls = ['staging', 'production'].includes(NODE_ENV);

let client, getAsync, setAsync, promiseClient;

if (!cacheConfig.host) {
  getAsync = null;
  setAsync = null;
} else {
  let socketOptions = {
    host: cacheConfig.host,
    port: cacheConfig.port,
  };

  if (useTls) {
    const sslOptions = {
      ca: process.env.CA_PATH ? fs.readFileSync(process.env.CA_PATH) : undefined,
      key: process.env.KEY_PATH ? fs.readFileSync(process.env.KEY_PATH) : undefined,
      cert: process.env.CERT_PATH ? fs.readFileSync(process.env.CERT_PATH) : undefined,
    };

    if (!sslOptions.ca || !sslOptions.key || !sslOptions.cert) {
      throw new Error('SSL options (CA_PATH, KEY_PATH, CERT_PATH) are required in staging or production environments.');
    }

    socketOptions = {
      ...socketOptions,
      tls: true,
      rejectUnauthorized: true,
      ...sslOptions,
    };
  }

  client = redis.createClient({
    socket: socketOptions,
    password: cacheConfig.password,
  });

  function connectionEstablished() {
    logger.info('Connected to Redis at ' + cacheConfig.host + ':' + cacheConfig.port);
  }

  function errorThrowing(err) {
    logger.error('Redis Client Error at ' + cacheConfig.host + ':' + cacheConfig.port, err);
  }

  client.on('error', errorThrowing);
  client.on('connect', connectionEstablished) ;
  promiseClient = async () => client.connect() ;
  getAsync      = promisify(client.get).bind(client);
  setAsync      = promisify(client.set).bind(client);
}
const cache = { client, getAsync, setAsync, promiseClient }
export { cache };
