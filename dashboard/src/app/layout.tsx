// app/root-layout.tsx (ou app/layout.tsx selon ton organisation)
import './css/style.css'
// import "./css/mdx.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/authenticationContext"; 
import { SignupProvider } from "@/context/signupContext";
import { SignupInvitationProvider } from "@/context/signupInvitationContext";
import { PaymentProvider } from "@/context/payment/paymentContext";
import type { Metadata } from 'next'
import type React from 'react'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Services CEO",
  description: "Powered by Services ",
  icons: {
    icon: "/images/LOGOROUGE.png",
    apple: "/public/images/LOGOROUGE.png",
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
        <SignupProvider>
          <AuthProvider>
            <PaymentProvider>
              <SignupInvitationProvider>
                <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
                  {children}
                </div>
              </SignupInvitationProvider>
            </PaymentProvider>
          </AuthProvider>
        </SignupProvider>
      </body>
    </html>
  );
}
