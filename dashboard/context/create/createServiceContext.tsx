"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "@/context/authenticationContext";
import SMPNotification from "@/src/components/notification";

export type Tag = {
  id: number;
  name: string;
  type: "Performance" | "Service" | "Métier" | "Autre";
};

export type ServiceFormData = {
  organizationID: string;
  title: string;
  description: string;
  price: number;
  lowerPrice: number;
  upperPrice: number;
  state: string;
  authorID: string;
  legalVatPercent: number;
  negotiable?: boolean;
  addressLine1?: string;
  placeKind?: string;
  hasPhysicalAddress: boolean;
  addressComplement?: string;
  postalCode?: string;
  city?: string;
  country: string;
  locationID?: string;
  supplyType: string;
  billingPlan: string;
  uptakeForm: string;
  advancedAttributes: {
    serviceTags: Tag[];
    synthese?: string;
  };
  images?: File[];
  uploadedMediaIDs?: string[];
};

export type ServiceContextType = {
  formData: ServiceFormData;
  updateFormData: (updates: Partial<ServiceFormData>) => void;
  submitService: () => Promise<void>;
  clearFormData: () => void;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setStep: (step: number) => void;
};

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

const defaultServiceFormData: ServiceFormData = {
  organizationID: "",
  title: "",
  description: "",
  price: 0,
  lowerPrice: 0,
  upperPrice: 0,
  state: "draft",
  authorID: "0",
  legalVatPercent: 20,
  negotiable: false,
  hasPhysicalAddress: false,
  supplyType: "mixed",
  billingPlan: "mixed",
  uptakeForm: "instant",
  country: "",
  advancedAttributes: {
    serviceTags: [],
    synthese: "",
  },
};

export const useServiceContext = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServiceContext must be used within a ServiceProvider");
  }
  return context;
};

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userID = user?.userID || "0";

  const [formData, setFormData] = useState<ServiceFormData>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("serviceFormData");
      return stored ? JSON.parse(stored) : defaultServiceFormData;
    }
    return defaultServiceFormData;
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("serviceFormData", JSON.stringify(formData));
    }, 300);
    return () => clearTimeout(timeout);
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<ServiceFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
      advancedAttributes: {
        ...prev.advancedAttributes,
        ...updates.advancedAttributes,
        serviceTags:
          updates.advancedAttributes?.serviceTags ?? prev.advancedAttributes.serviceTags,
        synthese:
          updates.advancedAttributes?.synthese ?? prev.advancedAttributes.synthese,
      },
    }));
  }, []);

  const clearFormData = useCallback(() => {
    localStorage.removeItem("serviceFormData");
    setFormData({ ...defaultServiceFormData, authorID: userID });
  }, [userID]);

  const submitService = useCallback(async () => {
    try {
      // Vérifier que le champ country est renseigné
      if (!formData.country) {
        throw new Error("Le champ 'country' est requis pour la localisation");
      }

      const locationPayload = {
        addressLine1: formData.addressLine1,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        placeKind: formData.placeKind || "road",
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

      const servicePayload = {
        organizationID: formData.organizationID,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        lowerPrice: formData.lowerPrice,
        upperPrice: formData.upperPrice,
        state: "online",
        authorID: userID,
        legalVatPercent: formData.legalVatPercent,
        negotiable: formData.negotiable,
        locationID: locationData.placeID,
        supplyType: formData.supplyType,
        billingPlan: formData.billingPlan,
        uptakeForm: formData.uptakeForm,
        advancedAttributes: JSON.stringify(formData.advancedAttributes),
      };

      // Debug: Vérifier que la synthèse est bien incluse
      console.log("=== DEBUG CREATION SERVICE ===");
      console.log("advancedAttributes avant stringify:", formData.advancedAttributes);
      console.log("synthese:", formData.advancedAttributes.synthese);
      console.log("advancedAttributes stringifié:", JSON.stringify(formData.advancedAttributes));

      const serviceRes = await fetch("/api/services/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(servicePayload),
      });
      const serviceData = await serviceRes.json();
      if (!serviceData?.serviceID) {
        throw new Error("La création de votre service a échoué");
      }

      // Upload des images si présentes
      if (formData.images && formData.images.length > 0) {
        const uploadedMediaIDs: string[] = [];
        
        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i];
          const uploadFormData = new FormData();
          uploadFormData.append('file', image);
          uploadFormData.append('entityID', serviceData.serviceID);
          uploadFormData.append('listingPosition', (i + 1).toString());
          uploadFormData.append('legend', image.name);

          try {
            const uploadRes = await fetch(`/api/upload/images/service`, {
              method: 'POST',
              body: uploadFormData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              uploadedMediaIDs.push(uploadData.media.mediaID);
            } else {
              console.error(`Erreur HTTP lors de l'upload de l'image ${i + 1}:`, uploadRes.status);
            }
          } catch (error) {
            console.error(`Erreur lors de l'upload de l'image ${i + 1}:`, error);
            // On continue avec les autres images même si une échoue
          }
        }

        // Mettre à jour le formData avec les IDs des médias uploadés
        updateFormData({ uploadedMediaIDs });
      }

      clearFormData();
      setNotification({
        show: true,
        type: "success",
        message: "Succès !",
        description:
          "Votre service a été créé avec succès. Vous allez être redirigé vers la page de vos services.",
      });

      setTimeout(() => {
        window.location.href = `/account/o/${formData.organizationID}/services`;
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création du service:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Erreur lors de la création",
        description:
          "Une erreur est survenue lors de la création de votre service. Merci de réessayer ou de contacter le support.",
      });
    }
  }, [formData, userID, clearFormData, updateFormData]);

  const goToNextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);
  const goToPreviousStep = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);
  const setStep = useCallback((step: number) => setCurrentStep(step), []);

  const contextValue = useMemo(
    () => ({
      formData,
      updateFormData,
      submitService,
      clearFormData,
      currentStep,
      goToNextStep,
      goToPreviousStep,
      setStep,
    }),
    [
      formData,
      updateFormData,
      submitService,
      clearFormData,
      currentStep,
      goToNextStep,
      goToPreviousStep,
      setStep,
    ]
  );

  const handleNotificationClose = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
    if (notification.type === "success") {
      window.location.href = `/account/${formData.organizationID}/services`;
    }
  }, [notification, formData.organizationID]);

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
      <SMPNotification
        type={notification.type}
        message={notification.message}
        description={notification.description}
        show={notification.show}
        onClose={handleNotificationClose}
      />
    </ServiceContext.Provider>
  );
};
