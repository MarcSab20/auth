// auth/src/app/layout.tsx - VERSION FINALE SIMPLE SANS POLICES PROBLÉMATIQUES

import './css/style.css'
import { AuthProvider } from "@/context/authenticationContext";
import { SignupProvider } from "@/context/signupContext";
import { MagicLinkProvider } from "@/context/magicLinkContext";
import { WaitingListSignupProvider } from "@/context/waitingListSignupContext";
import { SignupInvitationProvider } from "@/context/signupInvitationContext";
import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
  title: "Services - Authentication SDK",
  description: "Authentication module for Services platform powered by SMP SDK",
  icons: {
    icon: "/images/LOGOROUGE.png",
    apple: "/images/LOGOROUGE.png",
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        {/* 🔧 SOLUTION SIMPLE : Chargement via CDN sans Next.js font optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet"
          media="print"
        />
        <noscript>
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" 
            rel="stylesheet"
          />
        </noscript>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Configuration globale SDK
              window.SMP_CONFIG = {
                APP_ID: '${process.env.NEXT_PUBLIC_AUTH_APP_ID || ''}',
                API_URL: '${process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000'}',
                GRAPHQL_URL: '${process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'}',
                MAGIC_LINK_ENABLED: ${process.env.NEXT_PUBLIC_MAGIC_LINK_ENABLED !== 'false'},
                DEBUG: ${process.env.NODE_ENV === 'development'}
              };
              console.log('🔧 SMP_CONFIG loaded:', window.SMP_CONFIG);
            `,
          }}
        />
      </head>
      <body className="bg-white font-inter text-zinc-950 antialiased lg:bg-white dark:bg-zinc-900 dark:text-white">
        <AuthProvider>
          <MagicLinkProvider>
            <SignupProvider>
              <SignupInvitationProvider>
                <WaitingListSignupProvider>
                  <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
                    {children}
                  </div>
                </WaitingListSignupProvider>
              </SignupInvitationProvider>
            </SignupProvider>
          </MagicLinkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}