export interface DeviceInfo {
  // Informations de base sur le navigateur
  userAgent?: string;
  browserName?: string;
  browserVersion?: string;
  platform?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet' | 'unknown';

  // Résolution d'écran et dimensions de la fenêtre
  screenResolution?: string; // Exemple : '1920x1080'
  viewportSize?: string;     // Exemple : '1366x768'
  devicePixelRatio?: number;

  // Support des fonctionnalités du navigateur
  cookiesEnabled?: boolean;
  localStorageEnabled?: boolean;
  sessionStorageEnabled?: boolean;
  indexedDBEnabled?: boolean;
  serviceWorkerEnabled?: boolean;

  // Capacités matérielles
  hardwareConcurrency?: number | 'unknown'; // Nombre de threads logiques du processeur
  memory?: number | 'unknown';              // Approximation de la RAM en Go

  // Informations réseau
  networkType?: string;        // Exemple : 'wifi', '4g'
  downlinkSpeed?: number | 'unknown'; // Vitesse de téléchargement en Mbps
  rtt?: number | 'unknown';           // Round-trip time en ms

  // Informations sur les périphériques multimédia
  mediaDevices?: {
    audioInputSupported: boolean;
    videoInputSupported: boolean;
    microphones: string[];
    cameras: string[];
  };

  // Support des API du navigateur
  geolocationSupported?: boolean;
  webGLSupported?: boolean;
  webRTCSupported?: boolean;
  webAudioSupported?: boolean;

  // Langue et fuseau horaire
  language?: string;
  timezone?: string;

  // Informations supplémentaires avec navigator.userAgentData
  brands?: string;             // Exemple : 'Chromium, Google Chrome'
  mobile?: boolean;
  architecture?: string;
  model?: string;
  bitness?: string;
  uaFullVersion?: string;
}

function getPropertyValue<T extends keyof typeof Object>(
  objectName: T,
  propertyName: keyof typeof Object[T]
) {
  console.log(Object[objectName][propertyName]);
}

export function getDeviceInfo(): DeviceInfo {
  const deviceInfo: DeviceInfo = {};
  // Informations de base sur le navigateur
  deviceInfo.browserName = getBrowserName();
  deviceInfo.browserVersion = getBrowserVersion();
  deviceInfo.deviceType = /Mobi|Android|iPad|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  // Résolution et viewport
  deviceInfo.screenResolution = `${window.screen.width}x${window.screen.height}`;
  deviceInfo.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
  deviceInfo.devicePixelRatio = window.devicePixelRatio || 1;

  // Support des fonctionnalités
  deviceInfo.cookiesEnabled = navigator.cookieEnabled;
  deviceInfo.localStorageEnabled = typeof window.localStorage !== 'undefined';
  deviceInfo.sessionStorageEnabled = typeof window.sessionStorage !== 'undefined';
  deviceInfo.indexedDBEnabled = typeof window.indexedDB !== 'undefined';
  deviceInfo.serviceWorkerEnabled = 'serviceWorker' in navigator;

  // Capacités matérielles
  deviceInfo.hardwareConcurrency = navigator.hardwareConcurrency || 'unknown';
  deviceInfo.memory = (navigator as any).deviceMemory || 'unknown';

  // Informations réseau
  const connection = (navigator as any).connection || {};
  deviceInfo.networkType = connection.effectiveType || 'unknown';
  deviceInfo.downlinkSpeed = connection.downlink || 'unknown';
  deviceInfo.rtt = connection.rtt || 'unknown';

  // Support des médias
  deviceInfo.mediaDevices = {
    audioInputSupported: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
    videoInputSupported: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
    microphones: [],
    cameras: []
  };

  // Récupération des périphériques audio et vidéo
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      devices.forEach(device => {
        if (device.kind === 'audioinput') {
          deviceInfo.mediaDevices?.microphones.push(device.label);
        } else if (device.kind === 'videoinput') {
          deviceInfo.mediaDevices?.cameras.push(device.label);
        }
      });
    });
  }

  // Support des API du navigateur
  deviceInfo.geolocationSupported = 'geolocation' in navigator;
  deviceInfo.webGLSupported = isWebGLSupported();
  deviceInfo.webRTCSupported = 'RTCPeerConnection' in window;
  deviceInfo.webAudioSupported = 'AudioContext' in window || 'webkitAudioContext' in window;

  // Langue et fuseau horaire
  deviceInfo.language = navigator.language;
  deviceInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return deviceInfo;
}


// Fonction pour détecter le nom du navigateur
export function getBrowserName() {
  const userAgent = navigator.userAgent;

  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('SamsungBrowser') > -1) {
    return 'Samsung Internet';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
  } else if (userAgent.indexOf('Trident') > -1) {
    return 'Internet Explorer';
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  } else if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  }
  return 'Unknown';
}

// Fonction pour récupérer la version du navigateur
export function getBrowserVersion() {
  const userAgent = navigator.userAgent;
  const browserRegex = /(?:firefox|fxios|opera|opr|edg|chrome|safari|msie|trident(?=\/))\/?\s*([\d]+)/i;
  const matches = userAgent.match(browserRegex);
  return matches ? matches[1] : 'unknown';
}

// Fonction pour vérifier si WebGL est supporté
export function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}
