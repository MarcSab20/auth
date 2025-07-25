import React, { useState } from "react";
import { FaComment } from "react-icons/fa"; // Icône de commentaire
import { motion } from "framer-motion";

interface SMPCommentIconProps {
  onOpenOverlay: () => void;
  isMobileView: boolean;
}

const SMPCommentIcon: React.FC<SMPCommentIconProps> = ({ onOpenOverlay, isMobileView }) => {
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
 
  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      onOpenOverlay(); // Ouvre l'overlay après 1 seconde de survol
    }, 1000);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout); // Annule l'ouverture si la souris quitte avant 1 seconde
      setHoverTimeout(null);
    }
  };

  const handleClick = () => {
    onOpenOverlay(); // Ouvre l'overlay au clic aussi
  };

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick} // Ajoute l'ouverture au clic
      className={`absolute ${isMobileView ? "bottom-[0px] left-1/2 transform -translate-x-1/2" : "lg:top-[690px] lg:left-[24rem]"} flex items-center justify-center text-gray-700 cursor-pointer`} // Ajout de logique responsive
    >
      <FaComment className="h-6 w-6" />
      <span className="ml-2">Comments (10)</span>
    </motion.div>
  );
};

export default SMPCommentIcon;
