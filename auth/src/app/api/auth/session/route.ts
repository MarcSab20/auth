import { NextRequest, NextResponse } from "next/server";
import { AUTH_CONFIG } from "@/src/config/auth.config";

// 🔧 AJOUT : Forcer le mode dynamique pour éviter les erreurs de build statique
export const dynamic = 'force-dynamic';

interface SessionData {
  isAuthenticated: boolean;
  user?: any;
  appToken?: string;
  sessionId?: string;
  expiresAt?: string;
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [API] Demande validation session');
    
    // Récupérer les cookies
    const userToken = req.cookies.get(AUTH_CONFIG.COOKIES.USER_TOKEN)?.value;
    const appToken = req.cookies.get(AUTH_CONFIG.COOKIES.APP_TOKEN)?.value;
    const sessionId = req.cookies.get(AUTH_CONFIG.COOKIES.SESSION_ID)?.value;
    const userCookie = req.cookies.get('smp_user_0')?.value;

    console.log('🔍 [API] Cookies trouvés:', {
      userToken: userToken ? 'PRÉSENT' : 'ABSENT',
      appToken: appToken ? 'PRÉSENT' : 'ABSENT',
      sessionId: sessionId ? 'PRÉSENT' : 'ABSENT',
      userCookie: userCookie ? 'PRÉSENT' : 'ABSENT'
    });

    if (!userToken || !sessionId) {
      console.log('❌ [API] Session invalide: tokens manquants');
      return NextResponse.json({
        isAuthenticated: false,
        error: 'Session non trouvée'
      }, { status: 401 });
    }

    // Parser les données utilisateur si disponibles
    let user = null;
    if (userCookie) {
      try {
        user = JSON.parse(decodeURIComponent(userCookie));
      } catch (error) {
        console.error('❌ [API] Erreur parsing user cookie:', error);
      }
    }

    // Valider le token avec votre backend si nécessaire
    // TODO: Ajouter validation côté serveur du token

    const sessionData: SessionData = {
      isAuthenticated: true,
      user,
      appToken,
      sessionId,
      expiresAt: new Date(Date.now() + AUTH_CONFIG.COOKIES.MAX_AGE * 1000).toISOString()
    };

    console.log('✅ [API] Session validée pour utilisateur:', user?.email || 'inconnu');

    return NextResponse.json(sessionData);

  } catch (error: any) {
    console.error('❌ [API] Erreur validation session:', error);
    return NextResponse.json({
      isAuthenticated: false,
      error: 'Erreur interne'
    }, { status: 500 });
  }
}