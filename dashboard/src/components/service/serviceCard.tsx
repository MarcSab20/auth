// src/components/service/SMPServiceListingMedium.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentProvider } from "@/context/payment/paymentContext";
import useSWR from "swr";
import { FaEye, FaCommentDots, FaHeart } from "react-icons/fa";
import Image from "next/image";
import SMPServiceModal from "./serviceModalView";
import { useSearch } from "@/context/searchContext";
import ServiceListingMediumMedia from "./card/serviceListingMediumMedia";
import SMPServiceListingMediumMeta from "./card/serviceListingMediumMeta";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  views?: number;
  comments?: number;
  score?: number;
  likes?: number;
  serviceMedias?: { 
    serviceMediaID: string; 
    listingPosition: number; 
    legend?: string;
    media?: {
      url: string;
    };
  }[];
}

export default function SMPServiceListingMedium() {
  const router = useRouter();
  const { searchTerm } = useSearch();
  const { data: fallbackData } = useSWR<Service[]>("/api/services", fetcher);

  const [services, setServices] = useState<Service[]>(fallbackData || []);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Recherche
  useEffect(() => {
    if (!fallbackData) return;
    setServices(fallbackData);

    if (searchTerm && searchTerm.length >= 2) {
      setIsLoadingSearch(true);
      fetch("/api/services/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: { searchTerm } }),
      })
        .then((r) => r.json())
        .then((result: Service[]) => setServices(result))
        .catch(() => setServices([]))
        .finally(() => setIsLoadingSearch(false));
    }
  }, [searchTerm, fallbackData]);

  const handleCardClick = (service: Service) => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      router.push(`/service/${service.serviceID}`);
    } else {
      setSelectedService(service);
      setIsModalOpen(true);
    }
  };

  if (isLoadingSearch) {
    return <p className="text-center text-gray-400">Recherche en cours…</p>;
  }

  return (
    <PaymentProvider>
      <div className="w-full bg-transparent py-24 sm:py-32 font-chillax min-h-screen">
        {services.length === 0 ? (
          <p className="text-center text-gray-500">Aucun service disponible.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 justify-items-center">
            {services.map((service) => (
              <ServiceCard
                key={service.serviceID}
                service={service}
                onClick={() => handleCardClick(service)}
              />
            ))}
          </div>
        )}

        {isModalOpen && selectedService && (
          <SMPServiceModal
            isOpen={isModalOpen}
            service={{
              ...selectedService,
              serviceMedias: selectedService.serviceMedias?.map(m => ({
                serviceMediaID: m.serviceMediaID,
                listingPosition: m.listingPosition,
                legend: m.legend,
                url: m.media?.url || ""
              }))
            }}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </PaymentProvider>
  );
}

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}
function ServiceCard({ service, onClick }: ServiceCardProps) {
  const [hovered, setHovered] = useState(false);

  // Récupérer l'image principale depuis serviceMedias
  const mainImage = service.serviceMedias?.find(media => media.listingPosition === 1);
  const imageUrl = mainImage?.media?.url || "https://placehold.co/300x300";
  
  // Convertir serviceMedias en tableau d'URLs triées par position
  const imageUrls = service.serviceMedias
    ?.sort((a, b) => a.listingPosition - b.listingPosition)
    .map(media => media.media?.url)
    .filter((url): url is string => !!url) || [];

  // Récupérer la synthèse depuis advancedAttributes
  let synthese = '';
  try {
    if (service.advancedAttributes) {
      const attrs = JSON.parse(service.advancedAttributes);
      synthese = attrs.synthese || '';
    }
  } catch (e) {
    synthese = '';
  }
  const descriptionToShow = synthese || service.description;

  return (
    <motion.article
      className="relative flex flex-col bg-white w-full max-w-[420px] overflow-hidden rounded-lg group cursor-pointer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      {/* Media */}
      <div className="relative w-full">
        <ServiceListingMediumMedia 
          images={imageUrls}
          title={service.title}
          synthese={synthese}
        />
      </div>
      <h3 className="text-grey mt-3 text-lg font-semibold leading-tight">
        {service.title}
      </h3>
      {/* Bas de carte : radar + métadonnées */}
      <SMPServiceListingMediumMeta
        views={service.views}
        likes={service.likes}
        comments={service.comments}
      />
    </motion.article>
  );
}
