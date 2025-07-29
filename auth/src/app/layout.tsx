// auth/src/app/layout.tsx - VERSION AVEC TEST CORS
import './css/style.css'
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/authenticationContext";
import { SignupProvider } from "@/context/signupContext";
import { MagicLinkProvider } from "@/context/magicLinkContext";
import { WaitingListSignupProvider } from "@/context/waitingListSignupContext";
import { SignupInvitationProvider } from "@/context/signupInvitationContext";
import CorsTest from "@/src/components/debug/CorsTest";
import type { Metadata } from 'next'
import type React from 'react'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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
              // Configuration globale SDK
              window.SMP_CONFIG = {
                APP_ID: '${process.env.NEXT_PUBLIC_APP_ID || ''}',
                API_URL: '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}',
                GRAPHQL_URL: '${process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'}',
                MAGIC_LINK_ENABLED: ${process.env.NEXT_PUBLIC_MAGIC_LINK_ENABLED !== 'false'},
                DEBUG: ${process.env.NODE_ENV === 'development'}
              };
              console.log('🔧 SMP_CONFIG loaded:', window.SMP_CONFIG);
            `,
          }}
        />
      </head>
      <body className="bg-white font-chillax text-zinc-950 antialiased lg:bg-white dark:bg-zinc-900 dark:text-white">
        {/* Provider unifié avec SDK */}
        <AuthProvider>
          <MagicLinkProvider>
            <SignupProvider>
              {/* Providers de compatibilité pour des cas spéciaux */}
              <SignupInvitationProvider>
                <WaitingListSignupProvider>
                  <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
                    {children}
                  </div>
                  {/* Test CORS en développement */}
                  <CorsTest />
                </WaitingListSignupProvider>
              </SignupInvitationProvider>
            </SignupProvider>
          </MagicLinkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}