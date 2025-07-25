// src/components/dashboard/asset/AssetCreationCarouselContent.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAssetContext } from "@/context/create/createAssetContext";
import { useDashboardContext } from "@/context/dashboardContext";
import OrganizationAssetSlide from "./creationSlides/organizationAssetSlide";
import TitleSlide from "./creationSlides/titleSlide";
import PriceSlide from "./creationSlides/priceSlide";
import MediaSlide from "./creationSlides/mediaSlide";
import ConfigurationSlide from "./creationSlides/configurationSlide";
import AssetDescriptionSlide from "./creationSlides/assetDescriptionSlide";
import ConfirmationSlide from "./creationSlides/confirmationSlide";
import FinalSlide from "./creationSlides/finalSlide";
import { Button } from "@/src/components/landing-page/Button";
import Tips from "./tips";
import SMPNotification from "@/src/components/notification";
import ResumeAssetModal from "./resumeAssetFormModal";
import Pattern1 from "@/public/images/Pattern-2.svg";
import Pattern2 from "@/public/images/Pattern-2.svg";
import Pattern3 from "@/public/images/Pattern-3.svg";
import Pattern4 from "@/public/images/Pattern-4.svg";

const patterns = [Pattern1, Pattern2, Pattern3, Pattern4];
const chosenPattern = patterns[Math.floor(Math.random() * patterns.length)];

const steps = [
  { name: "Organisation", component: OrganizationAssetSlide, hasTips: false },
  { name: "Title", component: TitleSlide, hasTips: true },
  { name: "Price", component: PriceSlide, hasTips: true },
  { name: "Media", component: MediaSlide, hasTips: true },
  { name: "Configuration", component: ConfigurationSlide, hasTips: true },
  { name: "Description", component: AssetDescriptionSlide, hasTips: true },
  { name: "Confirmation", component: ConfirmationSlide, hasTips: true },
  { name: "Final", component: FinalSlide, hasTips: false },
];

interface Props {
  serviceID?: string;
  organizationID: string;
}

const AssetCreationCarouselContent: React.FC<Props> = ({
  serviceID,
  organizationID,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepValid, setIsStepValid] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "success" as "success" | "error" | "info",
    message: "",
    description: "",
  });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { organizationNav, loadingOrganizations } = useDashboardContext();
  const { formData, submitAsset, clearFormData } = useAssetContext();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("assetFormData");
    if (stored) {
      const data = JSON.parse(stored);
      if (data.title?.trim()) setShowResumeModal(true);
    }
  }, []);

  const isNextDisabled =
    currentStep === 0
      ? loadingOrganizations || organizationNav.length === 0
      : !isStepValid;

  const goToNextStep = useCallback(async () => {
    const stepName = steps[currentStep].name;
    // soumission
    if (stepName === "Confirmation") {
      if (submitting) return;
      setSubmitting(true);
      try {
        await submitAsset();
        setCurrentStep((s) => s + 1);
        setNotification({
          show: true,
          type: "success",
          message: "Succès !",
          description: "Votre asset a été créé.",
        });
      } catch (error) {
        console.error("Erreur lors de la création de l'asset:", error);
        setNotification({
          show: true,
          type: "error",
          message: "Erreur",
          description: "Impossible de créer l'asset.",
        });
        setSubmitting(false);
      }
      return;
    }

    // validation de chaque étape
    if (isNextDisabled) {
      if (currentStep === 0) {
        setNotification({
          show: true,
          type: "error",
          message: "Aucune organisation",
          description: "Veuillez créer ou choisir une organisation d'abord.",
        });
      } else {
        setNotification({
          show: true,
          type: "error",
          message: "Validation échouée",
          description: `Complétez "${stepName}" avant de continuer.`,
        });
      }
      return;
    }

    setCurrentStep((s) => s + 1);
  }, [currentStep, isNextDisabled, submitting, submitAsset]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const CurrentSlide = steps[currentStep].component;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white px-4 relative">
      <SMPNotification
        {...notification}
        show={notification.show}
        onClose={() => setNotification((n) => ({ ...n, show: false }))}
      />

      <ResumeAssetModal
        show={showResumeModal && currentStep === 0}
        data={{ title: formData.title, description: formData.description || "", price: formData.price || 0 }}
        onClose={() => setShowResumeModal(false)}
        onRestart={() => {
          clearFormData();
          setCurrentStep(0);
          setShowResumeModal(false);
          localStorage.removeItem("assetFormData");
        }}
      />

      <div className="w-full max-w-5xl bg-white p-16 rounded-2xl shadow-2xl flex flex-col justify-between h-[75%] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image src={chosenPattern} alt="Pattern" fill className="object-cover opacity-5" />
        </div>

        <div className="flex-1 z-10">
          <CurrentSlide
            onValidateStep={setIsStepValid}
            organizations={currentStep === 0 ? organizationNav : []}
            loading={currentStep === 0 ? loadingOrganizations : false}
            organizationID={currentStep === 0 ? organizationID || '' : ''}
            serviceID={serviceID || ''}
          />
        </div>

        {!isMobile && steps[currentStep].hasTips && (
          <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
            <Tips step={currentStep} context="asset" />
          </div>
        )}

        <div className={`mt-8 z-10 flex ${currentStep > 0 ? "justify-between" : "justify-end"}`}>
          {currentStep > 0 && !submitting && (
            <Button onClick={goToPreviousStep} className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg text-lg">
              Précédent
            </Button>
          )}
          {currentStep < steps.length - 1 && !submitting && (
            <Button
              onClick={goToNextStep}
              disabled={isNextDisabled}
              className={`px-6 py-3 rounded-lg text-lg ${
                isNextDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {steps[currentStep].name === "Confirmation" ? "Terminer" : "Suivant"}
            </Button>
          )}
          {submitting && (
            <div className="px-6 py-3 rounded-lg text-lg bg-gray-200 text-gray-600">
              Création en cours…
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetCreationCarouselContent;
