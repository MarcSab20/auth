// src/middleware/requestPlugin.js
import { uuid }       from '../utils/entityBuilder';
import { appConfig }  from '../configs/env.js';
import { db }         from '../configs/db.js';
import { cache }      from '../configs/cache.js';
import { logger }     from '../configs/logger.js';
// import { trace }      from '@opentelemetry/api';

// This is part of the context as it update both response accordingly to the request
const requestUUIDPlugin = (options) => ({
  async requestDidStart(defaultContext) {
    // const span = trace.getTracer('default').startSpan('requestUUIDPlugin');
    // SMP::Q:: to identifier quickly request queries from job queries and others
    const requestUniversalUniqID = "SMP::Q::" + uuid();
    if (!defaultContext.request.options.headers[options.requestIDKeyName]) {
      span.setAttribute(options.requestIDKeyName, requestUniversalUniqID)
      defaultContext.request.options.headers[options.requestIDKeyName] = requestUniversalUniqID;
    } 
    const log = logger.child({ requestId: requestUniversalUniqID });
    // log.info('Request UUID ADDING TO THE CONTEXT');
    span.end();
    return { db: db, logger: log, cache: cache, appConfig: appConfig, requestUUIID:requestUniversalUniqID};
  },
});

module.exports = {requestUUIDPlugin};
