'use client';

import React, { useState, useEffect } from 'react';
import RecapSection from './section/recap';
import DescriptionSection from './section/description';
import LegalInfoSection from './section/legalInformation';
import PreferencesSection from './section/preference';
import LocalisationSection from './section/localisation';
import MediaSection from './section/mediaSection';
import { useUpdateOrganizationContext } from '@/context/update/organization';

// Composants Catalyst
import { Heading, Subheading } from '@/src/components/catalyst/components/heading';
import { Button } from "@/src/components/landing-page/Button";
import { Divider } from '@/src/components/catalyst/components/divider';
import { Input } from '@/src/components/catalyst/components/input';
import { Label } from '@/src/components/catalyst/components/label';
import { Text } from '@/src/components/catalyst/components/text';
import SMPNotification from '@/src/components/notification';

interface OrganizationInformationProps {
  organizationID: string;
}

type AccordionState = {
  recap: boolean;
  description: boolean;
  legalInfo: boolean;
  preferences: boolean;
  localisation: boolean;
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
      <button onClick={onToggle} className="w-full flex justify-between items-center py-5 text-slate-800">
        <span className="font-medium">{title}</span>
        <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          {/* Icône plus/minus avec Catalyst */}
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

const OrganizationInformation: React.FC<OrganizationInformationProps> = ({ organizationID }) => {
  const {
    organizationFormData,
    locationFormData,
    initializeDataFromId,
    updateOrganizationForm,
    updateLocationForm,
    updateOrganizationMedia,
    deleteOrganizationMedia,
    submitUpdates,
  } = useUpdateOrganizationContext();

  // Accordéon initial : seule la section récapitulatif est ouverte par défaut.
  const [accordion, setAccordion] = useState<AccordionState>({
    recap: true,
    description: false,
    legalInfo: false,
    preferences: false,
    localisation: false,
  });

  // Initialiser les données si l'organisationID change
  useEffect(() => {
    if (organizationID && organizationFormData.organizationID !== organizationID) {
      initializeDataFromId(organizationID);
    }
  }, [organizationID, initializeDataFromId, organizationFormData]);

  useEffect(() => {
  }, [organizationFormData]);

  const toggleAccordion = (section: keyof AccordionState) => {
    setAccordion((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Heading level={1}>Modifiez votre Organisation</Heading>
      <Text color="secondary">
        Modifiez les informations et les paramètres de votre organisation.
      </Text>
      {/* Section Média */}
      <div className="mt-6">
        <MediaSection
          organizationID={organizationID}
          smallLogoUrl={organizationFormData.smallLogoUrl}
          smallLogoID={organizationFormData.smallLogoID}
          onMediaUpdate={updateOrganizationMedia}
          onMediaDelete={deleteOrganizationMedia}
        />
      </div>


      <Divider soft />

      <div className="mt-6 space-y-4">
        <AccordionItem
          title="Récapitulatif"
          isOpen={accordion.recap}
          onToggle={() => toggleAccordion("recap")}
        >
          <RecapSection
            organizationData={organizationFormData}
            locationData={locationFormData}
          />
        </AccordionItem>

        <AccordionItem
          title="Description"
          isOpen={accordion.description}
          onToggle={() => toggleAccordion("description")}
        >
          <DescriptionSection
            description={organizationFormData.description}
            handleChange={(field, value) => updateOrganizationForm({ [field]: value })}
          />
        </AccordionItem>

        <AccordionItem
          title="Informations Légales"
          isOpen={accordion.legalInfo}
          onToggle={() => toggleAccordion("legalInfo")}
        >
          <LegalInfoSection
            formData={organizationFormData}
            handleChange={(field, value) => updateOrganizationForm({ [field]: value })}
          />
        </AccordionItem>

        <AccordionItem
          title="Préférences"
          isOpen={accordion.preferences}
          onToggle={() => toggleAccordion("preferences")}
        >
          <PreferencesSection
            formData={organizationFormData}
            handleChange={(field, value) => updateOrganizationForm({ [field]: value })}
          />
        </AccordionItem>

        <AccordionItem
          title="Localisation"
          isOpen={accordion.localisation}
          onToggle={() => toggleAccordion("localisation")}
        >
          <LocalisationSection
            formData={locationFormData}
            handleChange={(field, value) => updateLocationForm({ [field]: value })}
          />
        </AccordionItem>
      </div>

      <div className="mt-6 flex justify-center">
        <Button 
          onClick={async () => {
            await submitUpdates();
          }}
        >
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
};

export default OrganizationInformation;
