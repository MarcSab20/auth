"use client";

import React, { useState, useRef, useEffect, StrictMode } from "react";
import { createPortal } from "react-dom";
import { Dialog } from "@headlessui/react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { TabsComponent } from "./tab";
import LikeButtonStarIcon from "../review/StarButton";
import SMPPriceTag from "./modal/priceTag";
import SMPServiceLargeMedia from "./modal/serviceLargeMedia";
import SMPCommentOverlay from "../comment/overlay"; 
import SMPPaymentOverlay from "../payment/paymentOverlay";
import { usePayment } from "@/context/payment/paymentContext";

interface Service {
  serviceID: string;
  uniqRef: string;
  slug: string;
  authorID: string;
  title: string;
  description: string;
  mediaBannerID?: string;
  termsAndConditionsID?: string;
  parentServiceID?: string;
  topicID?: string;
  organizationID?: string;
  locationID?: string;
  paymentConfigID?: string;
  price: number;
  legalVatPercent?: number;
  lowerPrice?: number;
  upperPrice?: number;
  negotiable?: boolean;
  perimeter?: number;
  supplyType: string;
  uptakeForm: string;
  billingPlan: string;
  onlineService?: boolean;
  advancedAttributes?: string; 
  state: string;
  createdAt: string; 
  updatedAt: string; 
  images?: string[];
  serviceMedias?: Array<{
    serviceMediaID: string;
    listingPosition: number;
    url: string;
    legend?: string;
  }>;
}

interface ModalProps {
  isOpen: boolean;
  service: Service;
  onClose: () => void;
}

const ROTATION_RANGE = 10;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

const SMPServiceModalView: React.FC<ModalProps> = ({ isOpen, service, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCommentOverlayOpen, setIsCommentOverlayOpen] = useState(false);
  const [isPaymentOverlayOpen, setIsPaymentOverlayOpen] = useState(false);
  const { setService } = usePayment();

  // S'assurer que le composant est monté côté client pour utiliser le portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Met à jour le service dans le contexte après le rendu initial
  useEffect(() => {
    const adaptedService = {
      id: service.serviceID,
      serviceID: service.serviceID,
      title: service.title,
      description: service.description,
      price: service.price,
      organizationId: service.organizationID || '',
      legalVatPercent: service.legalVatPercent,
      supplyType: service.supplyType,
      uptakeForm: service.uptakeForm,
      billingPlan: service.billingPlan,
      state: service.state,
      paymentConfigID: service.paymentConfigID,
      advancedAttributes: service.advancedAttributes,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    };
    setService(adaptedService);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.serviceID]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x);
  const ySpring = useSpring(y);
  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxHeight = 500; 
      const newHeight = Math.min(maxHeight, scrollY + 300);
      if (imageContainerRef.current) {
        imageContainerRef.current.style.height = `${newHeight}px`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;
    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;
    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const openPaymentOverlay = () => {
    setIsPaymentOverlayOpen(true);
  };

  if (!mounted) return null;

  return createPortal(
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          ref={modalRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ transformStyle: "preserve-3d", transform }}
          className="relative rounded-3xl p-0 max-w-[90%] w-full h-[90vh] max-h-[948px] md:max-w-[1400px] md:max-h-[948px] bg-white shadow-lg overflow-auto"
        >
          <motion.div
            className="absolute top-4 right-4 cursor-pointer text-gray-500 z-50"
            whileHover={{ rotate: 90 }}
            onClick={onClose}
          >
            <IoMdClose size={24} />
          </motion.div>
          <Dialog.Panel className="flex flex-col lg:flex-row h-full w-full">
            <div
              ref={imageContainerRef}
              className="lg:w-[60%] w-full h-full overflow-hidden rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none"
            >
              <SMPServiceLargeMedia 
                service={service} 
                price={service.price} 
                isMobileView={isMobileView} 
              />
            </div>

            <div className="lg:w-[40%] w-full flex flex-col relative overflow-auto">
              <div className="p-8 md:p-4 flex flex-col justify-between flex-grow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-center font-chillax text-gray-900">
                    {service.title}
                  </h2>
                  {isMobileView && <SMPPriceTag price={service.price} isMobileView={true} />}
                </div>

                <div className="flex-grow font-chillax overflow-y-auto">
                  <TabsComponent
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    description={service.description}
                    service={{ ...service, locationID: service.locationID ?? undefined }}
                  />
                </div>

                <div className="flex justify-center items-center">
                  <div className="w-12 h-3 sm:w-16 sm:h-16 md:w-20 md:h-20 flex justify-center items-center">
                    <StrictMode>
                      <LikeButtonStarIcon />
                    </StrictMode>
                  </div>
                </div>

                {isMobileView && (
                  <div className="fixed bottom-0 bg-black text-white text-center p-4 z-10 w-full">
                    <span className="py-2 opacity-50 cursor-not-allowed text-gray-400">
                      Poursuivre
                    </span>
                  </div>
                )}
              </div>

              <SMPCommentOverlay
                isOpen={isCommentOverlayOpen}
                onClose={() => setIsCommentOverlayOpen(false)}
                className="fixed inset-0 bg-white overflow-auto z-40"
                style={{ height: isMobileView ? '100%' : 'auto' }}
              />
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>

      {isPaymentOverlayOpen && (
        <SMPPaymentOverlay
          isOpen={isPaymentOverlayOpen}
          onClose={() => setIsPaymentOverlayOpen(false)}
          isMobileView={isMobileView} 
          price={service.price} 
          openOverlay={false}
        />
      )}
    </Dialog>,
    document.body
  );
};

export default SMPServiceModalView;
