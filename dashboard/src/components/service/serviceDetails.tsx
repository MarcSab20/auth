"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Heading } from "@/src/components/catalyst/components/heading";
import { Badge } from "@/src/components/catalyst/components/badge";
import { Divider } from "@/src/components/catalyst/components/divider";
import { Link } from "@/src/components/catalyst/components/link";
import ResponsiveCarousel from "@/src/components/responsiveCaroussel";
import TabsComponent from "@/src/components/service/tab";
import LikeButtonStarIcon from "../review/StarButton";
import { FrenchDate } from "@/src/components/frenchDate";
import SMPPriceTag from "./modal/priceTag";
import SMPPaymentOverlay from "@/src/components/payment/paymentOverlay";
import { Button } from "@/src/components/landing-page/Button";
import { usePayment } from "@/context/payment/paymentContext";
import ServiceRadarChart, { SERVICE_CRITERIA } from "./card/ServiceRadarChart";

export interface ServiceData {
  locationID: string | undefined;
  serviceID: string;
  title: string;
  description?: string;
  price: number;
  lowerPrice?: number;
  upperPrice?: number;
  legalVatPercent?: number;
  advancedAttributes?: string;
  images?: string[];
  serviceMedias?: Array<{
    serviceMediaID: string;
    listingPosition: number;
    legend?: string;
    media?: {
      url: string;
    };
  }>;
  createdAt?: string;
  state?: string;
  organizationID?: string;
  supplyType?: string;
  uptakeForm?: string;
  billingPlan?: string;
  paymentConfigID?: string;
  updatedAt?: string;
}

interface ServiceDetailsProps {
  service: ServiceData;
}

const ServiceDetailsModified: React.FC<ServiceDetailsProps> = ({ service }) => {
  const router = useRouter();
  const { setService } = usePayment();

  const [activeTab, setActiveTab] = useState<string>("Description");
  const [openPayment, setOpenPayment] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openPaymentModal = () => {
    setService(null);
    setTimeout(() => {
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
      setOpenPayment(true);
    }, 0);
  };

  const closePaymentModal = () => {
    setOpenPayment(false);
  };

  const getServiceImages = () => {
    if (service.serviceMedias && service.serviceMedias.length > 0) {
      return service.serviceMedias
        .sort((a, b) => a.listingPosition - b.listingPosition)
        .map(media => media.media?.url)
        .filter((url): url is string => !!url);
    }
    if (service.images && service.images.length > 0) {
      return service.images;
    }
    return [
      "https://placehold.co/550x350?text=Mock+1",
    ];
  };

  const imagesToShow = getServiceImages();

  const url = typeof window !== "undefined" ? `${window.location.origin}/star-icon.glb` : "/star-icon.glb";

  return (
    <motion.div
      className="bg-gray-50 min-h-screen py-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white p-6 relative">
        <div className="mb-4">
          <Link
            href="/services"
            className="hover:underline text-sm text-gray-500 flex items-center gap-1"
            onClick={() => router.back()}
          >
            <span>←</span> Retour
          </Link>
        </div>

        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Heading level={2}>{service.title}</Heading>
            <SMPPriceTag price={service.price} isMobileView={isMobile} />
          </div>

          {!isMobile && (
            <div className="w-full md:w-auto flex justify-center">
              <Button onClick={openPaymentModal}>Poursuivre</Button>
            </div>
          )}
        </header>

        <div className="mb-4 text-sm text-gray-500">
          Créé le <FrenchDate date={service.createdAt} /> · France
        </div>

        <Divider />

        <div className="mt-6">
          <ResponsiveCarousel>
            {imagesToShow.length > 0
              ? imagesToShow.map((img, idx) => {
                  const media = service.serviceMedias?.find(m => m.media?.url === img);
                  return (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt={media?.legend || `Image ${idx + 1}`}
                        className="w-[550px] h-[350px] object-cover rounded-lg"
                      />
                      {media?.legend && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                          {media.legend}
                        </div>
                      )}
                    </div>
                  );
                })
              : [
                  <div key="no-image" className="flex items-center justify-center w-[550px] h-[350px] bg-gray-100 rounded-lg text-gray-500 text-lg">
                    Ce service n'a pas encore d'image
                  </div>
                ]
            }
          </ResponsiveCarousel>
        </div>

        <Divider className="my-6" />

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex justify-center">
              <LikeButtonStarIcon />
            </div>
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-white flex items-center justify-center rounded">
                <ServiceRadarChart data={SERVICE_CRITERIA} size={96} hideLabels={true} color="black" />
              </div>
            </div>
          </div>

          <TabsComponent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            service={{ ...service, locationID: service.locationID ?? undefined }}
            description={service.description}
          />
        </div>
      </div>

      {isMobile && (
        <div
          className="fixed bottom-0 left-0 w-full bg-black text-white py-4 text-center cursor-pointer z-20"
          onClick={openPaymentModal}
        >
          Poursuivre
        </div>
      )}

      {openPayment && (
        <SMPPaymentOverlay
          isMobileView={isMobile}
          isOpen={openPayment}
          onClose={closePaymentModal}
          price={service.price}
          openOverlay={openPayment}
        />
      )} 
    </motion.div>
  );
};

export default ServiceDetailsModified;
