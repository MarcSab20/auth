import { API_CONFIG, MAGIC_LINK_ERRORS } from '@/src/config/api.config';

/**
 * Valide le format d'un token Magic Link
 */
export function validateMagicLinkToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const expectedLength = API_CONFIG.MAGIC_LINK.TOKEN_LENGTH;
  const hexPattern = new RegExp(`^[a-f0-9]{${expectedLength}}`);
  
  return hexPattern.test(token);
}

/**
 * Extrait le token Magic Link depuis l'URL
 */
export function extractMagicLinkToken(url?: string): string | null {
  try {
    const urlToCheck = url || (typeof window !== 'undefined' ? window.location.href : '');
    const urlObj = new URL(urlToCheck);
    const token = urlObj.searchParams.get('token');
    
    return token && validateMagicLinkToken(token) ? token : null;
  } catch {
    return null;
  }
}

/**
 * Construit l'URL complète du Magic Link
 */
export function buildMagicLinkUrl(token: string, baseUrl?: string, redirectUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  let url = `${base}/magic-link?token=${encodeURIComponent(token)}`;
  
  if (redirectUrl) {
    url += `&redirect=${encodeURIComponent(redirectUrl)}`;
  }
  
  return url;
}

/**
 * Masque une adresse email pour l'affichage
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  
  const visibleChars = Math.min(2, username.length);
  const maskedPart = '*'.repeat(username.length - visibleChars);
  
  return `${username.slice(0, visibleChars)}${maskedPart}@${domain}`;
}

/**
 * Parse une erreur Magic Link et retourne les détails appropriés
 */
export function parseMagicLinkError(error: any): {
  title: string;
  description: string;
  icon: string;
  canRetry: boolean;
} {
  const message = error?.message || error || '';
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('expired') || lowerMessage.includes('expiré')) {
    return {
      title: "Magic Link expiré",
      description: "Ce lien de connexion a expiré. Les Magic Links ne sont valides que pendant 30 minutes pour votre sécurité.",
      icon: "⏰",
      canRetry: false
    };
  }
  
  if (lowerMessage.includes('used') || lowerMessage.includes('utilisé')) {
    return {
      title: "Magic Link déjà utilisé",
      description: "Ce lien de connexion a déjà été utilisé. Chaque Magic Link ne peut être utilisé qu'une seule fois.",
      icon: "🔒",
      canRetry: false
    };
  }
  
  if (lowerMessage.includes('invalid') || lowerMessage.includes('invalide') || lowerMessage.includes('token')) {
    return {
      title: "Magic Link invalide",
      description: "Ce lien de connexion est invalide ou corrompu.",
      icon: "❌",
      canRetry: false
    };
  }
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connexion') || lowerMessage.includes('timeout')) {
    return {
      title: "Problème de connexion",
      description: "Impossible de vérifier votre Magic Link en raison d'un problème réseau.",
      icon: "📶",
      canRetry: true
    };
  }
  
  return {
    title: "Erreur de connexion",
    description: "Une erreur inattendue s'est produite lors de la vérification de votre Magic Link.",
    icon: "⚠️",
    canRetry: true
  };
}

/**
 * Génère un ID de requête unique
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Génère un ID de trace unique
 */
export function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Vérifie si Magic Link est activé
 */
export function isMagicLinkEnabled(): boolean {
  return API_CONFIG.MAGIC_LINK.ENABLED;
}

/**
 * Obtient la configuration Magic Link côté client
 */
export function getMagicLinkConfig() {
  return {
    enabled: API_CONFIG.MAGIC_LINK.ENABLED,
    tokenLength: API_CONFIG.MAGIC_LINK.TOKEN_LENGTH,
    expiryMinutes: API_CONFIG.MAGIC_LINK.EXPIRY_MINUTES,
    maxUsesPerDay: API_CONFIG.MAGIC_LINK.MAX_USES_PER_DAY,
    redirectUrl: API_CONFIG.MAGIC_LINK.REDIRECT_URL,
  };
}

/**
 * Calcule le temps restant avant expiration
 */
export function getTimeUntilExpiration(expiresAt: string): {
  expired: boolean;
  timeLeft: string;
  percentage: number;
} {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const totalDuration = API_CONFIG.MAGIC_LINK.EXPIRY_MINUTES * 60 * 1000; // en ms
  const timeLeft = expiry.getTime() - now.getTime();
  
  if (timeLeft <= 0) {
    return {
      expired: true,
      timeLeft: "Expiré",
      percentage: 0
    };
  }
  
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const percentage = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));
  
  return {
    expired: false,
    timeLeft: minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`,
    percentage
  };
}

/**
 * Stocke temporairement les données de Magic Link dans le sessionStorage
 */
export function storeMagicLinkData(data: {
  email?: string;
  action?: string;
  linkId?: string;
  expiresAt?: string;
}): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('magic_link_data', JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  }
}

/**
 * Récupère les données de Magic Link depuis le sessionStorage
 */
export function getMagicLinkData(): any | null {
  if (typeof window !== 'undefined') {
    try {
      const data = sessionStorage.getItem('magic_link_data');
      if (data) {
        const parsed = JSON.parse(data);
        // Vérifier que les données ne sont pas trop anciennes (1 heure max)
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed;
        } else {
          sessionStorage.removeItem('magic_link_data');
        }
      }
    } catch {
      sessionStorage.removeItem('magic_link_data');
    }
  }
  return null;
}

/**
 * Nettoie les données de Magic Link stockées
 */
export function clearMagicLinkData(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('magic_link_data');
  }
}
