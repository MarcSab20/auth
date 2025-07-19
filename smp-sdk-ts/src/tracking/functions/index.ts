import { EventType, UserContextCapturedEvent, UserAttributes, ContextCapturedEvent, UserHistoryCapturedEvent, DeviceInfoCapturedEvent, NetworkInfoCapturedEvent, PageContextCapturedEvent, SessionCapturedEvent, SMPEvent, CapturedEvent
 } from "./../types/SMPServicesEventType.js";
import { getDeviceInfo } from "../deviceInfo.js";
// Fonction pour récupérer les informations de l'utilisateur
export function getUserContextCapturedEvent(): UserContextCapturedEvent {
  // Simuler des attributs d'utilisateur
  const attributes: UserAttributes = {
    age: 28,
    gender: 'male',
    currentPreferences: ['photography', 'handicraft']
  };

  // Simuler des événements historiques de l'utilisateur
  const historyEvents: UserHistoryCapturedEvent = {
    purchases: [],
    locations: [],
    ratings: []
  };

  return {
    userId: '12345',
    attributes,
    historyEvents
  };
}

// Fonction pour récupérer les informations de la session
export function getSessionCapturedEvent(): SessionCapturedEvent {
  const sessionId = generateSessionId();
  const startTime = new Date().toISOString();

  return {
    sessionId,
    startTime
  };
}

// Générer un identifiant de session aléatoire
function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Fonction pour récupérer les informations de la page
export function getPageContextCapturedEvent(): PageContextCapturedEvent {
  return {
    url: window.location.href,
    title: document.title,
    referrer: document.referrer || undefined
  };
}


// Fonction pour récupérer les informations sur le réseau
export function getNetworkInfoCapturedEvent(): NetworkInfoCapturedEvent {
  return {
    ip: '127.0.0.1', // Simulé, il faudra obtenir l'IP via un service externe
    connectionType: ((navigator as any).connection as any).type || 'unknown',
    bandwidth: {
      up: ((navigator as any).connection as any).uplink || 0,
      down: ((navigator as any).connection as any).downlink || 0,
    }
  };
}

// Fonction pour vérifier si WebGL est supporté
function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

// Fonction pour récupérer toutes les informations de contexte
export function getContextCapturedEvent(): ContextCapturedEvent {
  return {
    user: getUserContextCapturedEvent(),
    session: getSessionCapturedEvent(),
    page: getPageContextCapturedEvent(),
    device: getDeviceInfo(),
    network: getNetworkInfoCapturedEvent(),
  };
}

// Exemple d'événement SMP
export function createSMPEvent(type: EventType, event: CapturedEvent): SMPEvent {
  const timestamp = new Date().toISOString();
  const context = getContextCapturedEvent();

  return {
    type: type,
    timestamp,
    event: event, // Simulé pour l'exemple
    context,
  };
}

// Fonction pour récupérer le nom du navigateur
function getBrowserName(): string {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

// Fonction pour récupérer la version du navigateur
function getBrowserVersion(): string {
  const userAgent = navigator.userAgent;
  const browserMatch = userAgent.match(/(firefox|chrome|safari|edge)\/(\d+)/i);
  return browserMatch ? browserMatch[2] : 'unknown';
}
