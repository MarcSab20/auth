import { SupportedLang } from "../i18n";
import { PersistenceKind, PersistenceType } from "./Persistence";

export interface RateLimitOptions {
  maxRequests: number;  // Nombre maximal de requêtes
  windowMs: number;     // Durée (en ms) pour cette limite
  message?: string;     // Message de dépassement de limite
};

export interface DataLimitOptions {
  maxDataSent: number;    // Quantité maximale de données envoyées (en octets)
  maxDataReceived: number; // Quantité maximale de données reçues (en octets)
  windowMs: number;        // Durée (en ms) pour cette limite
};


export interface SMPToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type SMPClientOptions = {
  appId                 : string;
  appSecret             : string;
  apiUrl                : string;
  graphqlUrl            : string;
  defaultLanguage       : SupportedLang;
  appAccessDuration     : number; // configurable duration for app token refresh
  userAccessDuration    : number; // configurable duration for user token refresh
  minUserAccessDuration : number; // enforced by backend
  minAppAccessDuration  : number; // enforced by backend
  persistence           : PersistenceKind;
  storage               : PersistenceType;
  rateLimits?: RateLimitOptions;
  dataLimits?: DataLimitOptions; // Limites de quantité de données échangées
  wsEnabled?: boolean;           // Activer WebSockets pour les notifications
 
};

/** 
* @deprecated
* @internal
* @hidden
*/
export type SMPConfig = SMPClientOptions ;