"use client";

import React from "react";
import { useAssetContext } from "@/context/create/createAssetContext";
import AccordionItem from "@/src/components/accordionItem";
import AssetGeneralSummary from "@/src/components/dashboard/asset/creationSlides/renderAssetGeneralSummary";
import MarkdownRenderer from "@/src/components/markdownRenderer";

const AssetConfirmationSlide: React.FC = () => {
  const { formData } = useAssetContext();

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Récapitulatif de l’Asset
      </h2>
      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto w-full space-y-6 px-4 max-h-[450px]">
        <AccordionItem title="Informations Générales">
          <AssetGeneralSummary {...formData} />
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

export default AssetConfirmationSlide;
