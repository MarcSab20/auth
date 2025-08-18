"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { OrganizationProvider, useOrganizationContext } from "@/context/create/createOrganizationContext";
import { Button } from '@/src/components/landing-page/Button'

import BrandAndLegalSlide from "./creationSlides/brandSlide";
import SectorSlide from "./creationSlides/sectorSlide";
import LocationSlide from "./creationSlides/locationSlide";
import LegalSlide from "./creationSlides/legalSlide";
import SummarySlide from "./creationSlides/summarySlide";
import ConfirmationSlide from "./creationSlides/confirmationSlide";
import SiretSlide from "./creationSlides/siretSlide";
import LogoUploadSlide from "./creationSlides/logoSlide";

import Tips from "./tips";

import Pattern1 from "@/public/images/Pattern-2.svg";
import Pattern2 from "@/public/images/Pattern-2.svg";
import Pattern3 from "@/public/images/Pattern-3.svg";
import Pattern4 from "@/public/images/Pattern-4.svg";

import ResumeOrganizationModal from "@/src/components/dashboard/organization/resumeOrganizationFormModal";

const patterns = [Pattern1, Pattern2, Pattern3, Pattern4];

const OrganizationCreationCarouselContent = () => {
  const { formData, submitOrganization, resetFormData } = useOrganizationContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chosenPattern] = useState(patterns[Math.floor(Math.random() * patterns.length)]);

  const steps = [
    { name: "BrandAndLegal", component: BrandAndLegalSlide, hasTips: true },
    { name: "Sector", component: SectorSlide, hasTips: true },
    { name: "Location", component: LocationSlide, hasTips: true },
    ...(formData.isLegallyExisting
      ? [
          { name: "Siret", component: SiretSlide, hasTips: true },
          { name: "Legal", component: LegalSlide, hasTips: true },
        ]
      : []),
    { name: "LogoUpload", component: LogoUploadSlide, hasTips: true },
    { name: "Summary", component: SummarySlide, hasTips: true },
    { name: "Confirmation", component: ConfirmationSlide, hasTips: false },
  ];

  const CurrentSlide = steps[currentStep]?.component;

  useEffect(() => {
    const stored = localStorage.getItem("orgFormData");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.brand?.trim()) setShowResumeModal(true);
      } catch (e) {
        console.error("Error parsing stored data:", e);
      }
    }
  }, []);

  const handleRestart = () => {
    resetFormData();
    setCurrentStep(0);
    setShowResumeModal(false);
    localStorage.removeItem("orgFormData");
  };

  const goToNextStep = async () => {
    if (currentStep === steps.length - 1) {
      if (submitting) return;
      setSubmitting(true);
      try {
        await submitOrganization();
      } catch (error) {
        setSubmitting(false);
      }
      return;
    }
    // Pour les autres étapes, seulement si la validation est ok
    if (isCurrentStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white px-4 relative">
      <ResumeOrganizationModal
        show={showResumeModal && currentStep === 0}
        data={{ brand: formData.brand, country: formData.country }}
        onClose={() => setShowResumeModal(false)}
        onRestart={handleRestart}
      />

      <div className="w-full max-w-5xl bg-white p-8 md:p-16 rounded-2xl shadow-2xl flex flex-col justify-between h-[85vh] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src={chosenPattern}
            alt="Background pattern"
            fill
            className="object-cover opacity-5"
            priority
          />
        </div>

        <div className="flex-1 z-10">
          {CurrentSlide && <CurrentSlide onValidateStep={setIsCurrentStepValid} />}
        </div>

        {steps[currentStep]?.hasTips && (
          <div className="mt-6 flex justify-center z-10">
            <Tips step={currentStep} />
          </div>
        )}

        <div className={`mt-6 z-10 flex ${currentStep > 0 ? "justify-between" : "justify-end"}`}>
          {currentStep > 0 && (
            <Button
              onClick={goToPreviousStep}
              variant="outline"
              className="text-gray-700"
            >
              Précédent
            </Button>
          )}
          {/* On cache le bouton en cas de soumission */}
          {!submitting && currentStep < steps.length && (
            <Button
              onClick={goToNextStep}
              className={isCurrentStepValid ? "" : "bg-gray-100 text-gray-400 cursor-not-allowed"}
              disabled={!isCurrentStepValid}
            >
              {currentStep === steps.length - 1 ? "Créer l'organisation" : "Suivant"}
            </Button>
          )}
          {submitting && (
            <Button
              className="px-6 py-3 rounded-lg shadow text-lg bg-gray-200 text-gray-600"
              disabled
            >
              Création en cours...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const OrganizationCreationCarousel = () => {
  return (
    <OrganizationProvider>
      <OrganizationCreationCarouselContent />
    </OrganizationProvider>
  );
};

export default OrganizationCreationCarousel;
