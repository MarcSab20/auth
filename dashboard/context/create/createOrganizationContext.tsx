"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "@/context/authenticationContext";
import SMPNotification from "@/src/components/notification";

export type OrganizationFormData = {
  authorID: string;
  ownerID?: number;
  orgRef?: string;
  sectorID?: number;
  legalName: string;
  brand?: string;
  sigle?: string;
  locationID?: string;
  address?: string;
  addressComplement?: string;
  postalCode?: string;
  smallLogoID?: string;
  oSize?: string;
  city: string;
  juridicForm?: string;
  legalUniqIdentifier?: string;
  vatNumber?: string;
  country?: string;
  communityVATNumber?: string;
  capital?: number;
  insuranceRef?: string;
  insuranceName?: string;
  description: string;
  state: string;
  isLegallyExisting: boolean;
  hasPhysicalAddress: boolean;
};

export type OrganizationContextType = {
  formData: OrganizationFormData;
  updateFormData: (updates: Partial<OrganizationFormData>) => void;
  resetFormData: () => void;
  submitOrganization: () => Promise<void>;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setStep: (step: number) => void;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const defaultFormData: OrganizationFormData = {
  authorID: "0",
  legalName: "",
  description: "",
  city: "",
  state: "processing",
  isLegallyExisting: false,
  hasPhysicalAddress: false,
};

export const useOrganizationContext = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganizationContext must be used within an OrganizationProvider");
  }
  return context;
};

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  // Récupération de l'utilisateur connecté via useAuth
  const { user } = useAuth();
  const userID = user?.userID 

  // Initialisation du formulaire depuis le localStorage si disponible
  const [formData, setFormData] = useState<OrganizationFormData>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("orgFormData");
      return stored ? JSON.parse(stored) : defaultFormData;
    }
    return defaultFormData;
  });

  const [currentStep, setCurrentStep] = useState<number>(0);

  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
    description: string;
  }>({
    show: false,
    type: "success",
    message: "",
    description: "",
  });

  // Sauvegarde dé-bouncée dans le localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("orgFormData", JSON.stringify(formData));
    }, 300);
    return () => clearTimeout(timeout);
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<OrganizationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(defaultFormData);
    setCurrentStep(0);
    localStorage.removeItem("orgFormData");
  }, []);

  // Utilisation d'une ref pour éviter les soumissions multiples
  const isSubmittingRef = useRef(false);

  const submitOrganization = useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      // Vérifier que le champ 'country' est renseigné
      if (!formData.country) {
        throw new Error("Le champ 'country' est requis pour la localisation");
      }

      // Création de la localisation via l'API commune
      const locationPayload = {
        addressLine1: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        placeKind: "road",
        state: "online",
        authorID: userID,
      };

      const locationRes = await fetch("/api/location/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationPayload),
      });
      const locationData = await locationRes.json();
      if (!locationData?.placeID) {
        throw new Error("La création de la localisation a échoué");
      }

      // Création de l'organisation avec le locationID obtenu
      const organizationPayload = {
        brand: formData.brand,
        juridicForm: formData.juridicForm,
        capital: formData.capital,
        sectorID: formData.sectorID,
        description: formData.description,
        legalName: formData.legalName,
        sigle: formData.sigle,
        locationID: locationData.placeID,
        smallLogoID: formData.smallLogoID,
        oSize: formData.oSize,
        vatNumber: formData.vatNumber,
        communityVATNumber: formData.communityVATNumber,
        insuranceRef: formData.insuranceRef,
        insuranceName: formData.insuranceName,
        legalUniqIdentifier: formData.legalUniqIdentifier,
        state: "online",
        authorID: Number(userID),
      };

      const orgRes = await fetch("/api/organization/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(organizationPayload),
      });
      const orgData = await orgRes.json();
      if (!orgData?.organizationID) {
        throw new Error("La création de votre organisation a échoué");
      }

      // Nettoyage des données enregistrées
      localStorage.removeItem("orgFormData");

      setNotification({
        show: true,
        type: "success",
        message: "Succès !",
        description: "Votre organisation a été créée avec succès. Vous allez être redirigé vers votre tableau de bord.",
      });

      setTimeout(() => {
        window.location.href = "/account";
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création de l'organisation:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Erreur lors de la création",
        description:
          "Une erreur est survenue lors de la création de votre organisation. Merci de réessayer ou de contacter le support.",
      });
    } finally {
      isSubmittingRef.current = false;
    }
  }, [formData, userID]);

  const goToNextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);
  const goToPreviousStep = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);
  const setStep = useCallback((step: number) => setCurrentStep(step), []);

  const contextValue = useMemo(
    () => ({
      formData,
      updateFormData,
      resetFormData,
      submitOrganization,
      currentStep,
      goToNextStep,
      goToPreviousStep,
      setStep,
    }),
    [
      formData,
      currentStep,
      updateFormData,
      resetFormData,
      submitOrganization,
      goToNextStep,
      goToPreviousStep,
      setStep,
    ]
  );

  const handleNotificationClose = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
    if (notification.type === "success") {
      window.location.href = "/account";
    }
  }, [notification]);

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
      <SMPNotification
        type={notification.type}
        message={notification.message}
        description={notification.description}
        show={notification.show}
        onClose={handleNotificationClose}
      />
    </OrganizationContext.Provider>
  );
};
