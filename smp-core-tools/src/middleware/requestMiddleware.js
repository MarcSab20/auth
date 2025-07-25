// src/middleware/requestUUIDMiddleware.js
import { v4 as uuidv4 } from 'uuid';
// const { trace } = require('@opentelemetry/api');
import { appConfig } from '../../src/configs/env.js'; 
import { appTokens } from '../../src/configs/appTokens.js'; 
import { default as jwt } from 'jsonwebtoken'; 

function useAppAuth(req, res, next) {
  if (!req.headers[appConfig.defaultXAppAPIKeyName]) {
    res.status = 401;
    // res.setHeader(appConfig.defaultXAppRequestIDKeyName, req.headers[appConfig.defaultXAppRequestIDKeyName]);
  }
  next();
}

function requestUUIDMiddleware(req, res, next) {
  if (!req.headers[appConfig.defaultXAppRequestIDKeyName]) {
    req.headers[appConfig.defaultXAppRequestIDKeyName] = uuidv4();
    res.setHeader(appConfig.defaultXAppRequestIDKeyName, req.headers[appConfig.defaultXAppRequestIDKeyName]);
  }
  next();
}

// Middleware pour vérifier le token d'application (applicative authentication)
function checkAppToken(req, res, next) {
  const apIDToken = req.headers[appConfig.defaultXAppAPIIdName];
  const appToken = appTokens[apIDToken]
  const token = req.headers[appConfig.defaultXAppAPITokenName] ?? appToken;
  if ((!token) ) {
    if(appConfig.envExc == "prod"){
      return res.status(403).json({ message: 'Forbidden' });
    } else {
      console.error(`======== NO ${appConfig.defaultXAppAPIIdName} FOR APPLICATION DETECTED =========`);
    }
    next();
  } else {
    jwt.verify(token, appConfig.appAccessTokenSalt, null, (err, decoded) => {
      if (err && appConfig.envExc == "prod" ) {
        return res.status(401).json({ message: 'Forbidden' });
      }
      if (err) {
        console.error(`======== INVALID APPLICATION TOKEN DETECTED =========`);
        console.error(JSON.stringify(token, null, 2));
      }
      const clientAppStaticConfig = {
        app: decoded,
        appId: apIDToken, 
        accessToken: token,
        receivedName: req.headers[appConfig.defaultXAppAPITitleName],
        receivedToken: req.headers[appConfig.defaultXAppAPITokenName],
        receivedAPIKey: req.headers[appConfig.defaultXAppAPIKeyName],
        receivedAppID: req.headers[appConfig.defaultXAppAPIIdName],
        receivedRequestID: req.headers[appConfig.defaultXAppRequestIDKeyName],
      }; 
      req.headers[appConfig.defaultXApplicationStructure] = clientAppStaticConfig; 
    });
    next();
  }
}

// Middleware pour vérifier le token d'utilisateur (user authentication)
function checkUserToken(req, res, next) {
  const userToken = req.headers['authorization'] ?? req.headers['Authorization'];
  if (!userToken || !userToken.startsWith('Bearer ')) {
    if (appConfig.envExc != "prod") {
      console.error("======== NO BEARER FOR USER UNDETECTED ========="); 
      console.log(`Nouvelle requête de ${req.ip} depuis ${req.headers.origin} + referrer :\n ${req.headers.referer} `);
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } else {
    // Extraction et vérification du token JWT from Bearer prefix
    const token = userToken.split(' ')[1];
    console.warn(`USER BAERER AUTHENTICATION:\n ${token}`);
    jwt.verify(token, appConfig.userAccessTokenSalt, (err, decoded) => {
      if (err && appConfig.envExc == "prod" ) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!decoded) {
        console.warn(JSON.stringify(err, null, 2));
      } else {
        console.log(`checkUserToken Decoded token: ${JSON.stringify(decoded, null, 2)}`);
        res.setHeader('user', decoded);
        // Si le token est valide, vous pouvez ajouter des informations de l'utilisateur à req.user
        req.headers["user"] = decoded; 
      }
      next();
    });
  }
}

export { requestUUIDMiddleware, useAppAuth, checkUserToken, checkAppToken};
