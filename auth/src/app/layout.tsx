import './css/style.css'
import { Inter } from "next/font/google";
import { EnhancedAuthProvider } from "@/context/authenticationContext";
import { EnhancedSignupProvider } from "@/context/enhancedSignupContext";
import { WaitingListSignupProvider } from "@/context/waitingListSignupContext";
import { SignupInvitationProvider } from "@/context/signupInvitationContext";
import { MagicLinkProvider } from "@/context/magicLinkContext"; 
import type { Metadata } from 'next'
import type React from 'react'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Services - Authentication",
  description: "Authentication module for Services platform",
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
      </head>
      <body className="bg-white font-chillax text-zinc-950 antialiased lg:bg-white dark:bg-zinc-900 dark:text-white">
        <EnhancedAuthProvider>
          <MagicLinkProvider> {/* NOUVEAU PROVIDER */}
            <EnhancedSignupProvider>
              <SignupInvitationProvider>
                <WaitingListSignupProvider>
                  <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
                    {children}
                  </div>
                </WaitingListSignupProvider>
              </SignupInvitationProvider>
            </EnhancedSignupProvider>
          </MagicLinkProvider>
        </EnhancedAuthProvider>
      </body>
    </html>
  );
}
