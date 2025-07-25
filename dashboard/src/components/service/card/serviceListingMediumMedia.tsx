// src/components/service/ServiceListingMediumMedia.tsx
"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import OverlayCard from "./serviceOverlayCard";

interface ServiceListingMediumMediaProps {
  images?: string[];
  title: string;
  synthese: string;
}

export default function ServiceListingMediumMedia({
  images,
  title,
  synthese,
}: ServiceListingMediumMediaProps) {
  const [hovered, setHovered] = useState(false);

  // fallback si pas d'images
  const imgs =
    Array.isArray(images) && images.length > 0
      ? images
      : ["https://placehold.co/400x300"];

  // On affiche juste la première image
  const mainImg = imgs[0];

  return (
    <div
      className="relative w-full max-w-[400px] aspect-[4/3] overflow-hidden mx-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={mainImg}
        alt={title}
        className="w-full h-full object-cover rounded-xl"
        style={{ aspectRatio: "4/3" }}
      />

      {/* Overlay animé */}
      <AnimatePresence>
        {hovered && (
          <div className="absolute inset-0 z-20">
            <OverlayCard title={title} synthese={synthese} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
