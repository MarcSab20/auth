import { SMPClient, Persistence, defaultLanguage } from "smp-sdk-ts";
import { AUTH_CONFIG, validateAuthConfig } from "./src/config/auth.config";
import { CookieManager} from "./src/lib/CookieManager";
import { SessionBridge } from "./src/lib/SessionBridge";

validateAuthConfig();

const storage = new Persistence('localStorage');

const confOpts = {
  appId: AUTH_CONFIG.AUTH_APP.APP_ID,           
  appSecret: AUTH_CONFIG.AUTH_APP.APP_SECRET,   
  apiUrl: AUTH_CONFIG.GATEWAY_URL, 
  graphqlUrl: AUTH_CONFIG.GRAPHQL_URL,
  defaultLanguage: defaultLanguage,
  appAccessDuration: AUTH_CONFIG.APP_ACCESS_DURATION,
  userAccessDuration: AUTH_CONFIG.USER_ACCESS_DURATION,
  minUserAccessDuration: AUTH_CONFIG.MIN_ACCESS_DURATION,
  minAppAccessDuration: AUTH_CONFIG.MIN_ACCESS_DURATION,
  persistence: Persistence.LocalStorageKind,
  storage: storage,
};

const smpClient = new SMPClient(confOpts);

export const initializeSMPClient = async () => {
  console.log("🔧 [SMP] Initialisation du client avec configuration unifiée");
  console.log("🔧 [SMP] Configuration:", {
    apiUrl: AUTH_CONFIG.API_URL,
    graphqlUrl: AUTH_CONFIG.GRAPHQL_URL,
    appId: AUTH_CONFIG.AUTH_APP.APP_ID? 'SET' : 'MISSING',
    appSecret: AUTH_CONFIG.AUTH_APP.APP_SECRET ? 'SET' : 'MISSING'
  });

  try {
    // 1. Synchroniser les tokens depuis les cookies si disponibles
    SessionBridge.syncTokensToStorage();

    // 2. Vérifier si l'app est déjà authentifiée
    const existingAppToken = await smpClient.getAppRefreshToken();
    
    if (!existingAppToken) {
      console.log("🔧 [SMP] Authentification de l'application requise");
      await smpClient.authenticateApp();
      console.log("✅ [SMP] Application authentifiée avec succès");
      
      // Synchroniser les nouveaux tokens vers les cookies
      SessionBridge.syncTokensToCookies();
    } else {
      console.log("✅ [SMP] Application déjà authentifiée");
    }

    const existingUserToken = await smpClient.getUserAccessToken();
    if (existingUserToken) {
      console.log("✅ [SMP] Utilisateur déjà authentifié");
    } else {
      console.log("ℹ️ [SMP] Aucun utilisateur connecté");
    }

  } catch (error) {
    console.error("❌ [SMP] Erreur lors de l'initialisation:", error);
    
    CookieManager.clearAllAuthCookies();
    localStorage.removeItem('smp_app_access_token');
    localStorage.removeItem('smp_app_refresh_token');
    
    throw error;
  }
};

export { smpClient };

