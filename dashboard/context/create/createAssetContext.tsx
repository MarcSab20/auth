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

export type AssetFormData = {
  organizationID: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  state: string;
  authorID: string;
  mediaID?: string;
  legalVatPercent: number;
  stockQuantity: number;
  maxPerReservation: number;
  images: File[];
};

export type AssetContextType = {
  formData: AssetFormData;
  updateFormData: (updates: Partial<AssetFormData>) => void;
  submitAsset: () => Promise<void>;
  clearFormData: () => void;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setStep: (step: number) => void;
  generateDescription: (context: string) => Promise<string>;
};

const AssetContext = createContext<AssetContextType | undefined>(undefined);

const defaultAssetFormData: AssetFormData = {
  organizationID: "",
  title: "",
  description: "",
  price: 0,
  quantity: 1,
  state: "draft",
  authorID: "0",
  legalVatPercent: 20,
  stockQuantity: 0,
  maxPerReservation: 1,
  images: [],
};

export const useAssetContext = (): AssetContextType => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error("useAssetContext must be used within an AssetProvider");
  }
  return context;
};

export const AssetProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userID = user?.userID || "0";

  const [formData, setFormData] = useState<AssetFormData>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("assetFormData");
      return stored ? JSON.parse(stored) : defaultAssetFormData;
    }
    return defaultAssetFormData;
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
      localStorage.setItem("assetFormData", JSON.stringify(formData));
    }, 300);
    return () => clearTimeout(timeout);
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<AssetFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const clearFormData = useCallback(() => {
    localStorage.removeItem("assetFormData");
    setFormData({ ...defaultAssetFormData, authorID: userID });
  }, [userID]);

  const generateDescription = useCallback(async (context: string) => {
    try {
      const response = await fetch('/api/ai/asset/description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          context,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate description');
      
      const data = await response.json();
      return data.description;
    } catch (error) {
      console.error('Error generating description:', error);
      throw error;
    }
  }, [formData.title]);

  const submitAsset = useCallback(async () => {
    try {
      // Première étape : création de l'asset
      const assetPayload = {
        organizationID: formData.organizationID,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        quantity: formData.quantity,
        state: "online",
        authorID: userID,
      };

      const assetRes = await fetch("/api/assets/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetPayload),
      });
      const assetData = await assetRes.json();
      if (!assetData?.assetID) {
        throw new Error("La création de votre asset a échoué");
      }

      // Deuxième étape : upload des images
      if (formData.images && formData.images.length > 0) {
        const uploadedMediaIDs: string[] = [];
        
        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i];
          const uploadFormData = new FormData();
          uploadFormData.append('file', image);
          uploadFormData.append('entityID', assetData.assetID);
          uploadFormData.append('listingPosition', (i + 1).toString());
          uploadFormData.append('legend', image.name);

          try {
            const uploadRes = await fetch(`/api/upload/images/asset`, {
              method: "POST",
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

        // Mettre à jour l'asset avec la première image comme image principale
        if (uploadedMediaIDs.length > 0) {
          await fetch(`/api/assets/${assetData.assetID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mediaID: uploadedMediaIDs[0]
            })
          });
        }
      }

      clearFormData();
      setNotification({
        show: true,
        type: "success",
        message: "Succès !",
        description:
          "Votre asset a été créé avec succès. Vous allez être redirigé vers la page de vos assets.",
      });

      setTimeout(() => {
        window.location.href = `/account/o/${formData.organizationID}/assets`;
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la création de l'asset:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Erreur lors de la création",
        description:
          "Une erreur est survenue lors de la création de votre asset. Merci de réessayer ou de contacter le support.",
      });
      throw error; // Propager l'erreur pour que le composant puisse gérer l'état de soumission
    }
  }, [formData, userID, clearFormData]);

  const goToNextStep = useCallback(() => setCurrentStep((prev) => prev + 1), []);
  const goToPreviousStep = useCallback(() => setCurrentStep((prev) => Math.max(prev - 1, 0)), []);
  const setStep = useCallback((step: number) => setCurrentStep(step), []);

  const contextValue = useMemo(
    () => ({
      formData,
      updateFormData,
      submitAsset,
      clearFormData,
      currentStep,
      goToNextStep,
      goToPreviousStep,
      setStep,
      generateDescription,
    }),
    [
      formData,
      updateFormData,
      submitAsset,
      clearFormData,
      currentStep,
      goToNextStep,
      goToPreviousStep,
      setStep,
      generateDescription,
    ]
  );

  const handleNotificationClose = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
    if (notification.type === "success") {
      window.location.href = `/account/o/${formData.organizationID}/assets`;
    }
  }, [notification, formData.organizationID]);

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
      <SMPNotification
        type={notification.type}
        message={notification.message}
        description={notification.description}
        show={notification.show}
        onClose={handleNotificationClose}
      />
    </AssetContext.Provider>
  );
}; 