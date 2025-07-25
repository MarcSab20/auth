"use client";

import React from "react";
import { useServiceContext } from "@/context/create/createServiceContext";
import AccordionItem from "@/src/components/accordionItem";
import ServiceGeneralSummary from "@/src/components/dashboard/service/creationSlides/renderGeneralSummary";
import ServiceAddressSummary from "@/src/components/dashboard/service/creationSlides/renderAddressSummary";
import MarkdownRenderer from "@/src/components/markdownRenderer";

const ServiceConfirmationSlide: React.FC = () => {
  const { formData } = useServiceContext();

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Récapitulatif du Service
      </h2>
      {/* Zone scrollable pour parcourir le contenu des accordéons */}
      <div className="flex-1 overflow-y-auto w-full space-y-6 px-4 max-h-[450px]">
        <AccordionItem title="Images">
          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-4 md:overflow-x-visible overflow-x-auto flex-nowrap flex md:grid md:flex-none">
            {formData.images?.map((image: any, index: number) => (
              <div key={index} className="w-full h-[120px] min-w-[120px] md:min-w-0">
                {image instanceof File ? (
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Service image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : image ? (
                  <img
                    src={typeof image === 'string' ? image : ''}
                    alt={`Service image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </AccordionItem>
        <AccordionItem title="Informations Générales">
          <ServiceGeneralSummary {...formData} />
        </AccordionItem>
        <AccordionItem title="Localisation">
          <ServiceAddressSummary {...formData} />
        </AccordionItem>
        <AccordionItem title="Description">
          <div className="space-y-2 scrollbar-thin">
            <MarkdownRenderer content={formData.description || "Aucune description fournie"} />
          </div>
        </AccordionItem>
      </div>
    </div>
  );
};

export default ServiceConfirmationSlide;
