// dashboard/src/app/page.tsx - FIX REDIRECTION ET DETECTION SESSION
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = {
  title: "Services — Dashboard",
  description: "Tableau de bord Services",
};

/**
 * 🔧 Validation cookie utilisateur améliorée
 */
async function validateUserFromCookie(cookieValue: string): Promise<{
  isValid: boolean;
  user?: any;
  error?: string;
}> {
  try {
    // Essayer plusieurs méthodes de parsing
    let user;
    
    // 1. Parsing direct
    try {
      user = JSON.parse(cookieValue);
    } catch (directError) {
      // 2. Avec décodage URI
      try {
        user = JSON.parse(decodeURIComponent(cookieValue));
      } catch (decodeError) {
        // 3. Avec double décodage
        try {
          user = JSON.parse(decodeURIComponent(decodeURIComponent(cookieValue)));
        } catch (doubleDecodeError) {
          return {
            isValid: false,
            error: 'Cookie parsing failed'
          };
        }
      }
    }

    // Validation de la structure utilisateur
    if (!user || typeof user !== 'object') {
      return {
        isValid: false,
        error: 'Invalid user structure'
      };
    }

    // Validation des champs requis
    if (!user.userID || !user.email) {
      return {
        isValid: false,
        error: 'Missing required user fields'
      };
    }

    // Validation utilisateur non temporaire
    if (user.userID.startsWith('temp-') || user.userID === 'anonymous') {
      return {
        isValid: false,
        error: 'Temporary user'
      };
    }

    // Validation de la fraîcheur (si timestamp disponible)
    if (user.timestamp) {
      const cookieAge = Date.now() - new Date(user.timestamp).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures
      
      if (cookieAge > maxAge) {
        return {
          isValid: false,
          error: 'Cookie expired'
        };
      }
    }

    console.log('✅ [DASHBOARD-HOME] Cookie utilisateur valide:', user.userID);
    return {
      isValid: true,
      user
    };

  } catch (error: any) {
    return {
      isValid: false,
      error: error.message || 'Cookie validation error'
    };
  }
}

/**
 * 🔧 Recherche cookies utilisateur dans plusieurs sources
 */
async function findUserCookie(cookieStore: any): Promise<{
  cookie?: any;
  source?: string;
  isValid: boolean;
  user?: any;
  error?: string;
}> {
  // Sources de cookies à vérifier dans l'ordre de priorité
  const cookieSources = [
    { name: 'smp_user_0', label: 'Primary' },
    { name: 'user_data', label: 'Fallback 1' },
    { name: 'auth_user', label: 'Fallback 2' }
  ];

  for (const source of cookieSources) {
    const cookie = cookieStore.get(source.name);
    
    if (cookie?.value) {
      console.log(`🔍 [DASHBOARD-HOME] Trying cookie source: ${source.label} (${source.name})`);
      
      const validation = await validateUserFromCookie(cookie.value);
      
      if (validation.isValid) {
        return {
          cookie,
          source: source.label,
          isValid: true,
          user: validation.user
        };
      } else {
        console.log(`⚠️ [DASHBOARD-HOME] Cookie ${source.name} invalid:`, validation.error);
      }
    }
  }

  return {
    isValid: false,
    error: 'No valid user cookie found'
  };
}

export default async function HomePage() {
  console.log('🔍 [DASHBOARD-HOME] Page d\'accueil Dashboard - vérification session...');
  
  const cookieStore = cookies();
  
  // 🔧 Recherche avancée de cookies utilisateur
  const userCookieResult = await findUserCookie(cookieStore);
  
  if (userCookieResult.isValid && userCookieResult.user) {
    console.log(`✅ [DASHBOARD-HOME] Session valide trouvée via ${userCookieResult.source}`);
    console.log(`📋 [DASHBOARD-HOME] Utilisateur: ${userCookieResult.user.userID} (${userCookieResult.user.email})`);
    
    // Vérifier également la cohérence avec d'autres cookies
    const sessionCookie = cookieStore.get("smp_session_id");
    const tokenCookie = cookieStore.get("smp_user_token") || cookieStore.get("access_token");
    
    console.log('🔍 [DASHBOARD-HOME] Cohérence cookies:', {
      user: '✅',
      session: sessionCookie ? '✅' : '⚠️',
      token: tokenCookie ? '✅' : '⚠️'
    });
    
    // Si les cookies sont cohérents, rediriger immédiatement
    if (sessionCookie && tokenCookie) {
      console.log('🚀 [DASHBOARD-HOME] Cookies cohérents - redirection immédiate vers /account');
      redirect("/account");
    } else {
      console.log('⚠️ [DASHBOARD-HOME] Cookies incohérents - redirection avec avertissement');
      
      // Rediriger avec un paramètre pour indiquer une session partielle
      const accountUrl = new URL('/account', 'http://localhost:3002');
      accountUrl.searchParams.set('sessionWarning', 'partial');
      redirect(accountUrl.toString().replace('http://localhost:3002', ''));
    }
  } else {
    console.log('❌ [DASHBOARD-HOME] Pas de session valide trouvée');
    console.log('📋 [DASHBOARD-HOME] Détails:', {
      error: userCookieResult.error,
      cookiesAvailable: Array.from(cookieStore.getAll()).map(c => c.name)
    });
  }
  
  // 🔧 Si aucune session valide, afficher un écran d'attente intelligent
  // au lieu de rediriger immédiatement vers auth
  console.log('🔄 [DASHBOARD-HOME] Aucune session - affichage écran d\'attente');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Logo/Branding */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Services Dashboard</h1>
          <p className="text-gray-600">Vérification de votre session...</p>
        </div>

        {/* État de chargement avec détails */}
        <div className="space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">⚡</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">Recherche de session active...</p>
            <p className="text-sm text-gray-500">
              Si cette page persiste, vous serez redirigé vers la connexion
            </p>
          </div>
        </div>

        {/* Indicateurs de diagnostic */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">État de la connexion</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Cookies de session:</span>
              <span className="text-gray-600">Recherche en cours...</span>
            </div>
            <div className="flex justify-between">
              <span>Authentification app:</span>
              <span className="text-gray-600">En attente...</span>
            </div>
            <div className="flex justify-between">
              <span>Validation utilisateur:</span>
              <span className="text-gray-600">En attente...</span>
            </div>
          </div>
        </div>

        {/* Actions d'urgence */}
        <div className="space-y-3">
          <p className="text-xs text-gray-500">Cette page devrait se charger automatiquement</p>
          
          <div className="flex justify-center space-x-4 text-sm">
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 hover:text-blue-800 underline hover:no-underline"
            >
              Actualiser
            </button>
            <span className="text-gray-300">|</span>
            <a 
              href="/account"
              className="text-blue-600 hover:text-blue-800 underline hover:no-underline"
            >
              Forcer l'accès
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="http://localhost:3000/signin"
              className="text-gray-600 hover:text-gray-800 underline hover:no-underline"
            >
              Se connecter
            </a>
          </div>
        </div>

        {/* Informations techniques (développement) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-xs font-medium text-yellow-900 mb-2">
              🔧 Mode Développement
            </h4>
            <div className="text-xs text-yellow-800 space-y-1 text-left">
              <p><strong>Erreur:</strong> {userCookieResult.error}</p>
              <p><strong>Cookies:</strong> {Array.from(cookieStore.getAll()).length} trouvé(s)</p>
              <p><strong>Auth App:</strong> http://localhost:3000</p>
              <p><strong>Dashboard:</strong> http://localhost:3002</p>
              <p><strong>Gateway:</strong> http://localhost:4000</p>
            </div>
          </div>
        )}

        {/* Auto-redirection après délai */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Redirection automatique après 5 secondes si la page ne se charge pas
              setTimeout(function() {
                console.log('🔄 [DASHBOARD-HOME] Auto-redirection vers auth');
                window.location.href = 'http://localhost:3000/signin?from=dashboard&timeout=true';
              }, 5000);
              
              // Essayer de forcer le rechargement du contexte d'authentification
              setTimeout(function() {
                if (window.location.pathname === '/') {
                  console.log('🔄 [DASHBOARD-HOME] Tentative d\\'accès direct à /account');
                  window.location.href = '/account';
                }
              }, 2000);
            `
          }}
        />
      </div>
    </div>
  );
}