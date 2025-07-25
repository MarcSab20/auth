"use client";

import React, { useEffect, useState } from "react";
import PreferencesSection from "./section/preference";
import { useUpdateOrganizationContext } from "@/context/update/organization";

// Composants Catalyst
import { Heading } from "@/src/components/catalyst/components/heading";
import { Button } from "@/src/components/landing-page/Button";
import { Divider } from "@/src/components/catalyst/components/divider";
import SMPNotification from "@/src/components/notification";
import { Text } from "@/src/components/catalyst/components/text";

interface OrganizationPreferencesProps {
  organizationID: string;
}

type AccordionState = {
  preferences: boolean;
};

type AccordionItemProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border-b border-slate-200">
      <button 
        onClick={onToggle} 
        className="w-full flex justify-between items-center py-5 text-slate-800"
      >
        <span className="font-medium">{title}</span>
        <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
        </span>
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-screen" : "max-h-0"}`}>
        <div className="pb-5 text-sm text-slate-500">{children}</div>
      </div>
    </div>
  );
};

const OrganizationPreferences: React.FC<OrganizationPreferencesProps> = ({ organizationID }) => {
  const {
    organizationFormData,
    initializeDataFromId,
    updateOrganizationForm,
    submitUpdates,
  } = useUpdateOrganizationContext();
  const [notification, setNotification] = useState({
    show: false,
    type: "success" as "success" | "error" | "info",
    message: "",
    description: "",
  });
  // Accordéon : seule la section "Préférences" est présente et ouverte par défaut.
  const [accordion, setAccordion] = useState<AccordionState>({ preferences: true });

  // Initialiser les données lorsque l'organisation change
  useEffect(() => {
    if (organizationID && organizationFormData.organizationID !== organizationID) {
      initializeDataFromId(organizationID);
    }
  }, [organizationID, initializeDataFromId, organizationFormData.organizationID]);

  const toggleAccordion = () => {
    setAccordion((prev) => ({ preferences: !prev.preferences }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Heading level={1}>Paramètres de l'Organisation</Heading>
      <Text color="secondary">
        Modifiez les paramètres de votre organisation ci-dessous.
      </Text>
      <Divider soft />

      {notification.show && (
        <SMPNotification
          type={notification.type}
          message={notification.message}
          description={notification.description}
          show={notification.show}
          onClose={() =>
            setNotification((prev) => ({ ...prev, show: false }))
          }
        />
      )}

      <AccordionItem
        title="Préférences"
        isOpen={accordion.preferences}
        onToggle={toggleAccordion}
      >
        <PreferencesSection
          formData={organizationFormData}
          handleChange={(field, value) =>
            updateOrganizationForm({ [field]: value })
          }
        />
      </AccordionItem>

      <div className="mt-10 flex justify-center">
        <Button
          onClick={async () => {
            try {
              await submitUpdates();
              setNotification({
                show: true,
                type: "success",
                message: "Mises à jour enregistrées",
                description:
                  "Vos modifications ont été enregistrées avec succès.",
              });
            } catch (error) {
              setNotification({
                show: true,
                type: "error",
                message: "Erreur",
                description:
                  "Une erreur s'est produite lors de l'enregistrement, veuillez réessayer.",
              });
            }
          }}
        >
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
};

export default OrganizationPreferences;
