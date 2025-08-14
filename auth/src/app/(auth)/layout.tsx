// auth/src/app/layout.tsx - AVEC OAUTH PROVIDER

import '../css/style.css'
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/authenticationContext";
import { SignupProvider } from "@/context/signupContext";
import { OAuthProvider } from "@/context/oauthContext"; // AJOUT OAUTH PROVIDER
import { MagicLinkProvider } from "@/context/magicLinkContext";
import { WaitingListSignupProvider } from "@/context/waitingListSignupContext";
import { SignupInvitationProvider } from "@/context/signupInvitationContext";
import ConfigDebug from "@/src/components/debug/ConfigDebug";
import GraphQLIntrospection from "@/src/components/debug/GraphQLIntrospection";
import SignupTest from "@/src/components/debug/SignupTest";
import type { Metadata } from 'next'
import type React from 'react'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Services - Authentication SDK",
  description: "Authentication module for Services platform powered by SMP SDK with OAuth support",
  icons: {
    icon: "/images/LOGOROUGE.png",
    apple: "/images/LOGOROUGE.png",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.className} antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Configuration globale SDK avec OAuth
              window.SMP_CONFIG = {
                APP_ID: '${process.env.NEXT_PUBLIC_AUTH_APP_ID || ''}',
                API_URL: '${process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000'}',
                GRAPHQL_URL: '${process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'}',
                MAGIC_LINK_ENABLED: ${process.env.NEXT_PUBLIC_MAGIC_LINK_ENABLED !== 'false'},
                OAUTH_ENABLED: true,
                GITHUB_OAUTH_ENABLED: ${process.env.NEXT_PUBLIC_GITHUB_OAUTH_ENABLED !== 'false'},
                GOOGLE_OAUTH_ENABLED: ${process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED !== 'false'},
                DEBUG: ${process.env.NODE_ENV === 'development'}
              };
              console.log('🔧 SMP_CONFIG loaded with OAuth:', window.SMP_CONFIG);
            `,
          }}
        />
      </head>
      <body className="bg-white font-chillax text-zinc-950 antialiased lg:bg-white dark:bg-zinc-900 dark:text-white">
        {/* Provider unifié avec SDK et OAuth */}
        <AuthProvider>
          <OAuthProvider> {/* AJOUT DU OAUTH PROVIDER */}
            <MagicLinkProvider>
              <SignupProvider>
                {/* Providers de compatibilité pour des cas spéciaux */}
                <SignupInvitationProvider>
                  <WaitingListSignupProvider>
                    <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
                      {children}
                    </div>
                    
                    {/* 🔧 OUTILS DE DEBUG - uniquement en développement */}
                    {process.env.NODE_ENV === 'development' && (
                      <>
                        <SignupTest />
                        <ConfigDebug />
                        <GraphQLIntrospection />
                      </>
                    )}
                  </WaitingListSignupProvider>
                </SignupInvitationProvider>
              </SignupProvider>
            </MagicLinkProvider>
          </OAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}