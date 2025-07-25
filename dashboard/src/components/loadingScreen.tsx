"use client";

import React from "react";
import Image from "next/image";
// Remplace par le chemin de ton nouveau logo
import newLogo from "@/public/images/LOGONOIR.png";

/**
 * Écran de chargement avec un logo qui effectue une rotation accélérée
 * sur 0.5 secondes.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50 loading-screen">
      <div className="rotate-container">
        <Image
          src={newLogo}
          alt="Loading..."
          width={80}   
          height={80} 
          className="spin-constant-animation"
        />
      </div>
    </div>
  );
}
