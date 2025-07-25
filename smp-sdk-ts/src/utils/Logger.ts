// import {createLogger, transports, format} from 'winston'; 

// const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.timestamp(),
//     format.errors({ stack: true }),
//     format.label({ label: 'SKD' }),
//     format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.stack || info.message}`),
//   ),
//   transports: [
//     new transports.Console(),
//   ],
// });

const logger  = {
  info: (...args: any[]) => {
    console.log(args);
  },
  error: (...args: any[]) => {
    console.error(args);
  },
  warn: (...args: any[]) => {
    console.warn(args);
  },
};

export { logger };
