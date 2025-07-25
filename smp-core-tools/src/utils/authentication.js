// src/utils/authentication.js
import pkgjwt from 'jsonwebtoken'; 
import { cache } from '../configs/cache.js';
import { appConfig } from '../../src/configs/env.js'; 
import { appTokens } from '../../src/configs/appTokens.js'; 
import pkgargon2 from 'argon2'; 
import bcrypt from 'bcryptjs';

const jwt = pkgjwt;
const argon2 = pkgargon2;
export const hashPassword = (password, salt = 12) => bcrypt.hash(password, salt);
export const comparePassword = (password, hashed) => bcrypt.compare(password, hashed);

const argonConfig = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,   // 64 MB
  timeCost: 3,           // The amount of computation realized and therefore the execution time
  parallelism: 6         // Number of threads
};
async function hashKeyWithArgon(key) {
  return await argon2.hash(key, argonConfig);
}
async function verifyKeyWithArgon(key, hashKey) {
  return await argon2.verify(hashKey, key);
}
async function hashTokenWithBCrypt(payload, salt) {
  return await bcrypt.hash(payload, salt);
}
async function verifyHashTokenWithBCrypt(unhashedToken, hashedToken) {
  return await bcrypt.compare(unhashedToken, hashedToken);
}
function generateJWTToken(payload, expirationDuration, secret) {
  // Handly compute the exp time to avoid a strange bug
  const expTime = new Number(Math.floor((new Date().getTime())/1000) + (new Number(expirationDuration)));
   const generatedToken = jwt.sign({...payload, maxAge: '350d', exp: expTime}, secret, {algorithm: 'HS512'});
  return generatedToken;
}

function verifyJWTToken(token, secret) {
  const verifResult = jwt.verify(token, secret, {algorithm: 'HS512'});
  return verifResult;
}
function generateUserToken(context, user, expirationDuration = appConfig.userRefreshTokenDuration, secret = appConfig.userJWTSecretSalt) {
  const userPayload = user.dataValues ?? user;
  context?.logger?.info(`Payload: ${JSON.stringify(user)}, expiration duration: ${expirationDuration}, Salt Secret: ${secret}`);
  return generateJWTToken(userPayload, expirationDuration, secret);
}
function generateAppToken(context, app, expirationDuration = appConfig.appRefreshTokenDuration, secret = appConfig.appJWTSecretSalt) {
  return generateJWTToken(app, expirationDuration, secret);
}
function verifyUserToken(context, userToken, secret = appConfig.userJWTSecretSalt) {
  context?.logger?.info(`User Refresh Token to check: ${userToken}, Secret to use: ${secret}`);
  return verifyJWTToken(userToken, secret);
}
function verifyAppToken(context, appToken, secret = appConfig.appJWTSecretSalt) {
  return verifyJWTToken(appToken, secret);
}

// Middleware pour vérifier le token d'utilisateur (user authentication)
function userFromToken(context, req, secret = appConfig.userAccessTokenSalt) {
  try {
    const userToken = req.headers['authorization'] ?? req.headers['Authorization'];
    if (!userToken || !userToken.startsWith('Bearer ')) {
      if (appConfig.envExc != "prod") {
        context.logger.error("======== NO BEARER FOR USER UNDETECTED "); 
        context.logger.error(`Nouvelle requête de ${req.ip} depuis ${req.headers.origin} + referrer :\n ${req.headers.referer} `);
      }
    } else {
      // Extraction et vérification du token JWT from Bearer prefix
      const token = userToken.split(' ')[1];
      return jwt.verify(token, secret ?? appConfig.userAccessTokenSalt, (err, decoded) => {
        if (err && appConfig.envExc == "prod" ) {
          context.logger.error("======== UNABLE TO VERIFY BEARER FOR USER =========");
        }
        req.headers["user"] = decoded; 
        return decoded;
      });
    }
    return null; 
  } catch (error) {
    console.error(`Error verifying user token: ${error}`);
    return null;
  }
}

// Middleware pour vérifier le token d'application (applicative authentication)
function applicationFromToken(appContext, req) {
  try {
    const apIDToken = req.headers[appConfig.defaultXAppAPIIdName];
    if (!apIDToken) {
      appContext.logger.error(`NO APPLICATION ID DETECTED =========`); 
      return null;
    }
    const appToken  = appTokens[apIDToken]
    const token     = req.headers[appConfig.defaultXAppAPITokenName] ?? appToken;
    if ((token) ) {
      return jwt.verify(token, appConfig.appAccessTokenSalt, null, (err, decoded) => {
        if (err) {
          appContext.logger.error(`INVALID APPLICATION TOKEN DETECTED =========`);
          appContext.logger.error(JSON.stringify(token, null, 2));
          return null;
        }
        req.headers[appConfig.defaultXApplicationStructure] = decoded; 
        return decoded;
      }); 
    }
    return null;  
  } catch (error) {
    console.error(`Error verifying application token: ${error}`);
    return null;
  }
}

class Authentication {
  constructor() {
    this.cachedUsers = [];
    this.user = undefined;
    this.app = undefined;
    this.cachedTokens = [];
    this.secretKey = appConfig.userJWTSecretSalt;
  }

  // // Fonction pour créer un nouveau compte utilisateur
  // createUser(username, password) {
  //   const hashedPassword = bcrypt.hashSync(password, 10);
  //   const user = new User({
  //     username,
  //     password: hashedPassword,
  //   });
  //   this.users.push(user);
  //   return user;
  // }

  // // Fonction pour authentifier un utilisateur en base sur son mot de passe
  // authenticateUser(username, password, login) {
  //   const user = this.users.find((user) => user.username === username && bcrypt.compareSync(password, user.password));
  //   if (!user) return null;
  //   return user;
  // }

  async hashTokenWithBCrypt(payload, salt) {
    return await bcrypt.hash(payload, salt);
  }
  async verifyHashTokenWithBCrypt(unhashedToken, hashedToken) {
    return await bcrypt.compare(unhashedToken, hashedToken);
  }

  generateUserToken(context, user, expirationDuration = appConfig.userRefreshTokenDuration, secret = appConfig.userJWTSecretSalt) {
    const userPayload = user.dataValues ?? user;
    const expTime = new Number(Math.floor((new Date().getTime())/1000) + (new Number(expirationDuration)));
    return generateJWTToken({...userPayload, maxAge: '350d', exp: expTime}, expirationDuration, secret);
  }
  generateUserRefreshToken(context, user, expirationDuration = appConfig.userRefreshTokenDuration) {
    return this.generateUserToken(context, user, expirationDuration, appConfig.userRefreshTokenSalt);
  }
  generateUserAccessToken(context, user, expirationDuration = appConfig.userRefreshTokenDuration) {
    return this.generateUserToken(context, user, expirationDuration, appConfig.userAccessTokenSalt);
  }
  generateAppToken(context, app, expirationDuration = appConfig.appRefreshTokenDuration, secret = appConfig.appJWTSecretSalt) {
    return generateJWTToken(app, expirationDuration, secret);
  }
  generateAppRefreshToken(context, app, expirationDuration = appConfig.appRefreshTokenDuration) {
    return generateAppToken(context, app, expirationDuration, appConfig.appRefreshTokenSalt);
  }
  generateAppAccessToken(context, app, expirationDuration = appConfig.appAccessTokenDuration) {
    return generateAppToken(context, app, expirationDuration, appConfig.appAccessTokenSalt);
  }
  
  verifyUserToken(context, userToken, secret = appConfig.userJWTSecretSalt) {
    return verifyJWTToken(userToken, secret);
  }
  verifyUserRefreshToken(context, userRefreshToken) {
    return verifyUserToken(context, userRefreshToken, appConfig.userRefreshTokenSalt);
  }
  verifyUserAccessToken(context, userAccessToken) {
    return verifyUserToken(context, userAccessToken, appConfig.userAccessTokenSalt);
  }
  verifyAppToken(context, appToken, secret = appConfig.appJWTSecretSalt) {
    return verifyJWTToken(appToken, secret);
  }

  // Fonction pour générer un token JWT pour un utilisateur authentifié
  generateToken(context, user, expirationDuration, secret) {

    const expTime = new Number(Math.floor((new Date().getTime())/1000) + (new Number(expirationDuration)));
    try {
      const generatedToken = jwt.sign({...payload, maxAge: '350d', exp: expTime}, secret ?? this.secretKey, {algorithm: 'HS512'});
      return generatedToken;
    } catch (err) {
      context?.logger?.error(`Error generated token for ${JSON.stringify(user, null, 2) }: ${JSON.stringify(err, null, 2) }`);
      return null;
    }
  }

  // Fonction pour vérifier si un token est valide
  verifyToken(context, token) {
    try {
      const decoded = jwt.verify(token, this.secretKey, {algorithm: 'HS512'});
      if (!decoded.userID || !decoded.username || !decoded.plan) return null;
      return decoded;
    } catch (err) {
      context?.logger?.error(`Error verifying token: ${err}`);
      return null;
    }
  }

  userFromHttpHeader(appContext, req) {
    if (!this.user) this.user = userFromToken(appContext, req);
    return this.user; 
  }
  applicationFromHttpHeader(appContext, req) {
    if (!this.app) this.app = applicationFromToken(appContext, req);
    return this.app;
  }
  userRetrieveRoles(appContext, req) {
    if (!this.app) this.app = applicationFromToken(appContext, req);
    return this.app;
  }
  // Fonction pour vérifier si un utilisateur est connecté
  isConnected(user) {
    return user && this.tokens[user._id];
  }

  // Fonction pour supprimer un token JWT
  deleteToken(userId) {
    if (!this.tokens[userId]) return;
    delete this.tokens[userId];
  }
}


export {
  Authentication,
  generateUserToken,
  generateAppToken,
  hashKeyWithArgon,
  verifyKeyWithArgon,
  verifyUserToken,
  verifyAppToken,
  verifyHashTokenWithBCrypt,
  hashTokenWithBCrypt, applicationFromToken, userFromToken
};
