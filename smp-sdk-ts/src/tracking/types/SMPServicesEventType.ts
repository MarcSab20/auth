
export type EventType = "click" | "view" | "purchase" | "scroll" | "form_submit" | "hover" | "section_time_spent" | "inactivity" | "abandon_form_event" | "submission_form_event" | "submit_form_event" ;

export type FormField = {
  fieldName: string;
  filledValue?: string;
  isCompleted: boolean;
  isInError: boolean;
  error?: string;
};

export type FormAbandonmentEvent = {
  formId: string;
  fields: FormField[];
};

export type FormSubmissionEvent = {
  formId: string;
  fields: FormField[];
  };
  
export type FormEvent = FormAbandonmentEvent | FormSubmissionEvent;

export type ScrollCapturedEvent = {
  depth?: number; // Profondeur du scroll en pourcentage ex: 70 (pourcentage de la page scrollée)
  timestamp: string; // ISO 8601 date format
  duration?: number; // En millisecondes pour les événements comme "view" ou "scroll"
  metadata?: any; // Pour ajouter des données contextuelles supplémentaires (si nécessaire)
};

export type ViewCapturedEvent = {
  depth?: number; // Profondeur du scroll en pourcentage ex: 70 (pourcentage de la page scrollée)
  timestamp: string; // ISO 8601 date format
  duration?: number; // En millisecondes pour les événements comme "view" ou "scroll"
  metadata?: any; // Pour ajouter des données contextuelles supplémentaires (si nécessaire)
};

export type ButtonClickCapturedEvent = {
  elementId: string; // ID du bouton ou élément cliqué
  timestamp: string;
};

export type SectionTimeSpentCapturedEvent = {
  sectionId: string; // ID de la section de la page
  timeSpent: number; // Temps passé en millisecondes
  timestamp: string;
};

export type InactivityCapturedEvent = {
  timestamp: string;
  duration: number; // Durée d'inactivité en millisecondes
};

export type MouseCapturedEvent = {
  position: {
    x: number;
    y: number;
  };
  timestamp: string;
}
export type RatingCapturedEvent = {
  serviceId: string;
  rating: number; // Note donnée par l'utilisateur
};

export type PurchaseHCapturedEvent = {
  serviceId: string;
  category: string;
  price: number;
  purchaseDate: string; // ISO 8601 date format
};

export type LocationCapturedEvent = {
  location: string;
  coordinates?: {
    lon: number;
    lat: number;
  }
};

type ServiceTrackinkEvent = {
  serviceId: string;
  url: string;
  tags: string[]; // ex: ["wedding", "portrait"]
  price: number;
};

export type UserAttributes = {
  age?: number;
  gender?: string;
  currentPreferences?: string[]; // ex: ["photography", "handicraft"]
};

export type UserHistoryCapturedEvent = {
  purchases?: PurchaseHCapturedEvent[];
  locations?: LocationCapturedEvent[];
  ratings?: RatingCapturedEvent[];
};

export type UserContextCapturedEvent = {
  userId?: string; 
  attributes?: UserAttributes;
  historyEvents?: UserHistoryCapturedEvent;
};

export type SessionCapturedEvent = {
  sessionId: string;
  startTime: string;
  endTime?: string; // Peut être mis à jour lors de la fin de la session
  totalDuration?: number; // Durée de la session en millisecondes
};

export type PageContextCapturedEvent = {
  url: string;
  title: string;
  referrer?: string; // Optionnel, la page précédente
};


export interface DeviceInfoCapturedEvent {
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

export type NetworkInfoCapturedEvent = {
  ip: string;
  connectionType: "wifi" | "cellular" | "ethernet";
  bandwidth?: {
    up: number;
    down: number;
  }
};

export type ContextCapturedEvent = {
  user: UserContextCapturedEvent;
  session: SessionCapturedEvent;
  page: PageContextCapturedEvent;
  device?: DeviceInfoCapturedEvent;
  network?: NetworkInfoCapturedEvent;
};

export type SMPEvent = {
  type: EventType;
  timestamp: string; // ISO 8601 date format 
  event: CapturedEvent; // Données de l'événement
  context: ContextCapturedEvent; // Contexte de l'événement (page, device, network)
  metadata?: any; // Pour ajouter des données contextuelles supplémentaires (si nécessaire)
};


export type CapturedEvent = ScrollCapturedEvent | ButtonClickCapturedEvent | SectionTimeSpentCapturedEvent | InactivityCapturedEvent | VideoEvent | MouseEvent | FormEvent ;
