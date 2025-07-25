// src/configs/logger.js
import { appConfig } from './env.js';
import winston from 'winston'; 
import { LogstashTransport } from 'winston-logstash-transport';

const getRequestLogger = (label) => {
  // Créer un format personnalisé avec la date et l'heure
  const serviceLogFormat = winston.format.printf(({ level, message, timestamp, requestId }) => {
    return `[${requestId ? `${requestId}` : 'QUERY-IN'}@${label}]::${level}:${timestamp} - ${message}`;
  });

  return winston.createLogger({
    level: 'info', // Ici, vous pouvez ajouter une configuration pour changer le niveau dynamiquement
    format: winston.format.combine(
      winston.format.label({ label }),
      winston.format(info => {
        info.requestId = info.requestId || undefined;
        return info;
      })(),
      winston.format.timestamp({ format: 'YYYYMMDDHHmmss.SSS' }),

      serviceLogFormat
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `logs/error.log`, level: 'error' }),
      new winston.transports.File({ filename: `logs/warning.log`, level: 'warning' }),
      new winston.transports.File({ filename: `logs/combined.log` }),
      new LogstashTransport({
        port: process.env.SMP_LOGSTASH_PORT ?? 5000,
        node_name: appConfig.componentShortName ?? 'smp-ussp',
        host: process.env.LOGSTASH_HOST_NAME ?? 'localhost',
        ssl_enable: process.env.LOGSTASH_SSL_ENABLED ?? false,
        max_connect_retries: -1, // Pour des tentatives infinies
        timeout_connect_retries: 10000 // Temps d'attente entre les tentatives
      })
    ],
  });
};

const logger = getRequestLogger(appConfig.componentTag);

export { getRequestLogger, logger };