import React, { useState, useRef } from 'react';
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { motion } from "framer-motion";
import PriceTag from "./priceTag"; // Import du composant PriceTag
import { Button } from "@/src/components/landing-page/Button";


interface CarouselComponentProps {
  images: string[];
  price: number; // Ajouter le prix en tant que prop
}

const CarouselComponent: React.FC<CarouselComponentProps> = ({ images, price }) => {
  const [openOverlay, setOpenOverlay] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterPoursuivre = () => {
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenOverlay(true);
    }, 500);
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

  return (
    <div className="relative w-full h-full overflow-hidden">
     
     <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop={true}
        autoPlay
        className="h-full"
      >
        {images.map((image, index) => (
          <div key={index} className="h-full">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </Carousel>

      {/* Bandeau Poursuivre avec animation lumineuse */}
      <motion.div
        id="poursuivre"
        className="absolute bottom-0 w-full text-center bg-black bg-opacity-30 text-white py-4 cursor-pointer"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        whileHover={{
          backgroundImage: isHovered
            ? "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)"
            : "none",
          backgroundSize: "200% auto",
          transition: { duration: 1, ease: "easeInOut" },
          backgroundPosition: "100%",
        }}
        onMouseEnter={handleMouseEnterPoursuivre}
        onMouseLeave={handleMouseLeavePoursuivre}
        onClick={handleClickPoursuivre}
      >
        POUSUIVRE
      </motion.div>

      {/* Overlay qui apparaît après 0.5 seconde de survol ou au clic */}
      {openOverlay && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-black bg-opacity-80 z-10 flex items-center justify-center"
        >
          <div className="container mx-auto sm:px-6 lg:px-8">
            {/* Content goes here */}
            {/* <SMPPurchaseSteps /> */}
          <h2 className="text-2xl font-bold text-white">Contenu du workflow ici</h2>

          </div>
          <Button
            className="absolute top-4 right-4 text-white"
            onClick={() => setOpenOverlay(false)}
          >
            Fermer
          </Button>

          {/* Ajout du PriceTag sous l'overlay */}
          <div className="absolute bottom-4 left-4">
            <PriceTag price={price} isMobileView={false} />
          </div>
          
        </motion.div>
      )}
    </div>
  );
};

export default CarouselComponent;