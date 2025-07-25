// src/utils/context.js 
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../configs/env.js';
import { logger } from '../configs/logger.js';
import { cache } from '../configs/cache.js';
import { db } from '../configs/db.js';

// This is part of the context as it update both response accordingly to the request
const requestUUIDPlugin = (defaultContext) => { 
    // SMP::Q:: to identifier quickly request queries from job queries and others
  const requestUniversalUniqID = uuidv4();

  if (defaultContext && defaultContext.request) {
    if (defaultContext.request.options) {
      if (!defaultContext.request.options.headers[appConfig.defaultXAppRequestIDKeyName]) {
        defaultContext.request.options.headers[appConfig.defaultXAppRequestIDKeyName] = `SMP::Q::${requestUniversalUniqID}`;
      }
    }
  }

  return { ...defaultContext, requestUUIID: requestUniversalUniqID };
};

function getUserTokenFromHeaders(req) {
  let token = '';
  if (req && req.headers) {
    const authHeader = req.headers.authorization || '';
    token = authHeader.split('Bearer ')[1];    
  }
 return token;
}

function getAppAPIKeyFromHeaders(req) {
  let token = '';
  if (req && req.headers) {
    const authHeader = req.headers.authorization || '';
    token = authHeader.split('AppApiKey ')[1];
  }
  return token;
}

function authsContext(req) {

  if (!req) {
    return { userBearerToken: '', appAPIKey: '' }
  }
  const userBearerToken = getUserTokenFromHeaders(req);
  const appAPIKey = getAppAPIKeyFromHeaders(req);
  return { userBearerToken: userBearerToken, appAPIKey: appAPIKey }
}

function updateContext(defaultContext) {
  const newContext = requestUUIDPlugin(defaultContext);
  const log = logger.child({ requestId: newContext?.requestUUIID ?? "NO_REQUEST_ID" });
  const auths = defaultContext ? authsContext(defaultContext.request) : {};
  return {...defaultContext, ...{logger: log, cache: cache, config: appConfig }, ...auths }
}

export {
  updateContext,
  getUserTokenFromHeaders,
  getAppAPIKeyFromHeaders,
}

