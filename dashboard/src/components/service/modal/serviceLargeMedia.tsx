// src/components/payment/SMPServiceLargeMedia.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import SMPPriceTag from "./priceTag";
import SMPFlowPaymentOverlay from "../../payment/paymentOverlay";
import { usePayment } from "@/context/payment/paymentContext";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface ServiceMediaInfo {
  serviceMediaID: string;
  listingPosition: number;
  url: string;
  legend?: string;
}

interface SMPServiceLargeMediaProps {
  service: {
    serviceMedias?: ServiceMediaInfo[];
  };
  price: number;
  isMobileView: boolean;
}

const SMPServiceLargeMedia: React.FC<SMPServiceLargeMediaProps> = ({
  service,
  price,
  isMobileView,
}) => {
  const [openOverlay, setOpenOverlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Récupération du service et de la fonction pour initier la transaction depuis le contexte
  const { transaction, actions } = usePayment();

  // Dès que l'overlay s'ouvre et que le service est défini, on appelle la mutation pour créer la Transaction
  useEffect(() => {
    if (openOverlay && service && !transaction) {
      actions.initiateTransactionFlow().catch(console.error);
    }
  }, [openOverlay, service]);

  const handleMouseEnterPoursuivre = () => {
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenOverlay(true);
    }, 1200);
  };

  const handleMouseLeavePoursuivre = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleClickPoursuivre = () => {
    setOpenOverlay(true);
  };

  // Récupérer toutes les images triées par position
  const images = service.serviceMedias
    ?.sort((a, b) => a.listingPosition - b.listingPosition)
    ?.map(media => media.url) || [];
  
  const displayImages = images.length > 0 ? images : ["https://placehold.co/400x300"];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="w-full h-full flex items-center justify-center">
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay={false}
          className="w-full max-w-[400px]"
        >
          {displayImages.map((image: string, index: number) => (
            <div
              key={index}
              className="relative w-full aspect-[4/3] mx-auto rounded-xl overflow-hidden flex items-center justify-center"
              style={{ maxWidth: "400px", width: "100%", height: "300px" }}
            >
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                style={{ width: "400px", height: "300px", maxWidth: "100%", maxHeight: "100%" }}
              />
            </div>
          ))}
        </Carousel>
      </div>

      <SMPPriceTag price={price} isMobileView={isMobileView} />

      {/* Bouton pour desktop uniquement */}
      {!isMobileView && (
        <motion.div
          className="absolute bottom-0 w-full text-center bg-black text-white py-4 cursor-pointer hover:bg-gray-600 transition-colors duration-200"
          onMouseEnter={handleMouseEnterPoursuivre}
          onMouseLeave={handleMouseLeavePoursuivre}
          onClick={handleClickPoursuivre}
        >
          POURSUIVRE
        </motion.div>
      )}

      {/* Overlay pour desktop uniquement */}
      {!isMobileView && (
        <SMPFlowPaymentOverlay
          isOpen={openOverlay}
          onClose={() => setOpenOverlay(false)}
          isMobileView={isMobileView}
          price={price}
          openOverlay={false}
        />
      )}
    </div>
  );
};

export default SMPServiceLargeMedia;
