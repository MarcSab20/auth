"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useServiceContext } from "@/context/create/createServiceContext";
import { useDashboardContext } from "@/context/dashboardContext";
import TitleSlide from "./creationSlides/titleSlide";
import DescriptionSlide from "./creationSlides/descriptionSlide";
import PriceSlide from "./creationSlides/priceSlide";
import PriceRangeSlide from "./creationSlides/priceRange";
import PhysicalAddressSlide from "./creationSlides/adresseSlide";
import OrganizationSlide from "./creationSlides/organizationSlide";
import TagSlide from "./creationSlides/tagSlide";
import ServiceImagesSlide from "./creationSlides/serviceImagesSlide";
import ConfirmationSlide from "./creationSlides/confirmationSlide";
import FinalSlide from "./creationSlides/finalSlide";
import { Button } from "@/src/components/landing-page/Button";

import Tips from "./tips";
import SMPNotification from "../../notification";
import ResumeServiceModal from "@/src/components/dashboard/service/resumeServiceFormModal";
import Pattern1 from "@/public/images/Pattern-2.svg";
import Pattern2 from "@/public/images/Pattern-2.svg";
import Pattern3 from "@/public/images/Pattern-3.svg";
import Pattern4 from "@/public/images/Pattern-4.svg";

const patterns = [Pattern1, Pattern2, Pattern3, Pattern4];
const chosenPattern = patterns[Math.floor(Math.random() * patterns.length)];

const steps = [
  { name: "Organization", component: OrganizationSlide, hasTips: true },
  { name: "Title", component: TitleSlide, hasTips: true },
  { name: "Price", component: PriceSlide, hasTips: true },
  { name: "Price Range", component: PriceRangeSlide, hasTips: true },
  { name: "Physical Address", component: PhysicalAddressSlide, hasTips: true },
  { name: "Tag", component: TagSlide, hasTips: true },
  { name: "Service Images", component: ServiceImagesSlide, hasTips: true },
  { name: "Description", component: DescriptionSlide, hasTips: true },
  { name: "Confirmation", component: ConfirmationSlide, hasTips: true },
  { name: "Final", component: FinalSlide, hasTips: false },
];

interface Props {
  organizationID: string | null;
}

const ServiceCreationCarouselContent: React.FC<Props> = ({ organizationID }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
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
  const { formData, submitService, clearFormData } = useServiceContext();

  // Détection du mode mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("serviceFormData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.title?.trim()) setShowResumeModal(true);
      } catch (e) {
        console.error("Erreur lors du parsing du serviceFormData :", e);
      }
    }
  }, []);

  const isNextDisabled =
    currentStep === 0
      ? (!organizationID && (loadingOrganizations || organizationNav.length === 0))
      : !isCurrentStepValid;

  const goToNextStep = useCallback(async () => {
    if (currentStep === 0 && (!organizationID && (loadingOrganizations || organizationNav.length === 0))) {
      setNotification({
        show: true,
        type: "error",
        message: "Aucune organisation trouvée",
        description: "Veuillez créer une organisation avant de continuer.",
      });
      return;
    }
    if (currentStep === 8) {
      if (submitting) return;
      setSubmitting(true);
      try {
        await submitService();
        setCurrentStep(9);
        setNotification({
          show: true,
          type: "success",
          message: "Soumission réussie",
          description: "Votre service a été créé avec succès.",
        });
      } catch (error) {
        console.error("Erreur lors de la création du service:", error);
        setNotification({
          show: true,
          type: "error",
          message: "Erreur lors de la soumission",
          description: "Impossible de soumettre le service. Veuillez réessayer.",
        });
        setSubmitting(false);
      }
      return;
    }
    if (isCurrentStepValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setNotification({
        show: true,
        type: "error",
        message: "Validation échouée",
        description: `Veuillez remplir tous les champs requis avant de continuer dans "${steps[currentStep].name}".`,
      });
    }
  }, [
    currentStep,
    isCurrentStepValid,
    loadingOrganizations,
    organizationNav,
    submitting,
    submitService,
    organizationID,
  ]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  const CurrentSlide = steps[currentStep]?.component;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white px-4 relative">
      <SMPNotification
        type={notification.type}
        message={notification.message}
        description={notification.description}
        show={notification.show}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      <ResumeServiceModal
        show={showResumeModal && currentStep === 0}
        data={{ organizationID: formData.organizationID, title: formData.title }}
        onClose={() => setShowResumeModal(false)}
        onRestart={() => {
          clearFormData();
          setCurrentStep(0);
          setShowResumeModal(false);
          localStorage.removeItem("serviceFormData");
        }}
      />
      <div className="w-full max-w-5xl bg-white p-16 rounded-2xl shadow-2xl flex flex-col justify-between h-[75%] relative overflow-hidden">
        {/* Fond de pattern */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src={chosenPattern}
            alt="Background pattern"
            fill
            className="object-cover opacity-5"
          />
        </div>
        {/* Slide principal */}
        <div className="flex-1 z-10">
          {CurrentSlide && (
            <CurrentSlide
              onValidateStep={setIsCurrentStepValid}
              organizations={currentStep === 0 ? organizationNav : []}
              loading={currentStep === 0 ? loadingOrganizations : false}
              organizationID={currentStep === 0 ? organizationID : null}
            />
          )}
        </div>
        {/* Tips affichés en desktop uniquement */}
        {!isMobile && steps[currentStep]?.hasTips && (
          <div className="absolute bottom-20 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <Tips step={currentStep} />
          </div>
        )}
        {/* Navigation */}
        <div className={`mt-8 z-10 flex ${currentStep > 0 ? "justify-between" : "justify-end"}`}>
          {currentStep > 0 && (
            <Button
              onClick={goToPreviousStep}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg text-lg shadow hover:bg-gray-400 transition duration-200"
            >
              Précédent
            </Button>
          )}
          {currentStep < 9 && !submitting && (
            <Button
              onClick={goToNextStep}
              className={`px-6 py-3 rounded-lg shadow text-lg transition duration-200 ${
                isNextDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              disabled={isNextDisabled}
            >
              {currentStep === 8 ? "Terminer" : "Suivant"}
            </Button>
          )}
          {submitting && (
            <div className="px-6 py-3 rounded-lg shadow text-lg bg-gray-200 text-gray-600">
              Création en cours...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCreationCarouselContent;
