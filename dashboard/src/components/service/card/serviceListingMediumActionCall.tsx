import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SMPCommentIcon from "@/public/images/bulle.png";
import SMPDollarIcon from "@/public/images/dollars.png";

interface ActionButtonsProps {
  onOpenModal: (openPaymentDirectly?: boolean) => void; // Nouveau paramètre
  onOpenPoursuivre: () => void;
}

const SMPServiceListingMediumActionCall: React.FC<ActionButtonsProps> = ({
  onOpenModal,
  onOpenPoursuivre,
}) => {
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState<"modal" | "poursuivre" | null>(null);

  const handleMouseEnter = (buttonType: "modal" | "poursuivre") => {
    setIsHovered(buttonType);
    hoverTimeoutRef.current = setTimeout(() => {
      if (buttonType === "modal") {
        onOpenModal(true); // Indique qu'on veut ouvrir la modal ET l'overlay de paiement
      } else if (buttonType === "poursuivre") {
        onOpenPoursuivre();
      }
    }, 1000); // Délai de 1 seconde
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current); // Annuler le timeout si on quitte avant 1 seconde
      hoverTimeoutRef.current = null;
    }
    setIsHovered(null);
  };

  return (
    <motion.div className="flex justify-center mt-4 space-x-4 relative">
      {/* Bouton pour ouvrir la modal */}
      <motion.button
        onMouseEnter={() => handleMouseEnter("modal")}
        onMouseLeave={handleMouseLeave}
        className="bg-white text-white rounded-full p-2 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '65px', 
          height: '40px',
        }}
      >
        <Image src={SMPDollarIcon} alt="modal icon" width={40} height={40} />
      </motion.button>
      {/* Bouton pour ouvrir Poursuivre */}
      <motion.button
        onMouseEnter={() => handleMouseEnter("poursuivre")}
        onMouseLeave={handleMouseLeave}
        className="bg-white text-white rounded-full p-2 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '50px', 
          height: '40px',
        }}
      >
        <Image src={SMPCommentIcon} alt="poursuivre icon" width={40} height={40} />
      </motion.button>
    </motion.div>
  );
};

export default SMPServiceListingMediumActionCall;