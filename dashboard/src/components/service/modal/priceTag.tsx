import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Importer Image de Next.js pour gérer les images
import logoTag from "@/public/images/LOGOBLANC.png"; // Import de ton logo

interface PriceTagProps {
  price: number | undefined; 
  isMobileView: boolean; 
}

const SMPPriceTag: React.FC<PriceTagProps> = ({ price, isMobileView }) => {
  const [isLogoVisible, setIsLogoVisible] = useState(true); // État pour contrôler la visibilité du logo

  return (
    <motion.div
      className={`flex items-center bg-black text-white py-2 px-4 rounded-full z-19 ${
        isMobileView ? 'ml-4' : 'absolute top-4 right-4'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }} // Apparition initiale du tag
      style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }} // Forcer l'affichage en ligne
    >
      {/* Logo qui apparaît en premier et rétrécit après l'apparition du prix */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }} // Apparition fluide du logo
        exit={{ opacity: 0, scale: 0 }}
        className="mr-2"
        style={{
          width: isLogoVisible ? '20px' : '12px', // Réduction de la taille du logo
          height: isLogoVisible ? '20px' : '12px',
          transition: 'all 0.5s ease-in-out', // Transition fluide pour la taille
        }}
      >
        <Image src={logoTag} alt="Logo" width={isLogoVisible ? 20 : 12} height={isLogoVisible ? 20 : 12} /> {/* Utilisation de ton logo */}
      </motion.div>

      {/* Prix en gras qui apparaît après 1 seconde */}
      <motion.span
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.7, ease: "easeInOut" }} // Apparition avec un délai après le logo
        className="font-bold"
        onAnimationComplete={() => {
          // Réduire le logo au lieu de le faire disparaître
          setTimeout(() => {
            setIsLogoVisible(false);
          }, 500); // Réduction après un délai d'une demi-seconde après l'apparition du prix
        }}
      >
        {price}
      </motion.span>
    </motion.div>
  );
};

export default SMPPriceTag;