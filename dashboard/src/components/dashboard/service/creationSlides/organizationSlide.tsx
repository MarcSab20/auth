"use client";

import React, { useState, useEffect, useRef } from "react";
import { useServiceContext } from "@/context/create/createServiceContext";
import Link from "next/link";
import { Button } from "@/src/components/catalyst/components/button";

export interface Organization {
  organizationID?: string; 
  name: string;
  icon?: string;
  role?: "Owner" | "Admin" | "Guest" | "Member";
  organizationType?: string;
}

interface OrganizationSlideProps {
  onValidateStep: (isValid: boolean) => void;
  organizations: Organization[];
  loading: boolean;
  organizationID?: string | null; // Prop pour pré-sélection
}

const OrganizationSlide: React.FC<OrganizationSlideProps> = ({
  onValidateStep,
  organizations,
  loading,
  organizationID,
}) => {
  const { formData, updateFormData } = useServiceContext();
  const initialOrgID = organizationID || formData.organizationID || null;
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(initialOrgID);
  const [isMobile, setIsMobile] = useState(false);
  const validatedRef = useRef(false);

  // Détecte le responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pendant le chargement ou s'il n'y a aucune organisation, invalider la slide
  useEffect(() => {
    if (loading || organizations.length === 0) {
      onValidateStep(false);
    }
  }, [loading, organizations, onValidateStep]);

  // Si une organisation est pré-sélectionnée, la valider (une seule fois)
  useEffect(() => {
    if (initialOrgID && !validatedRef.current) {
      setSelectedOrganization(initialOrgID);
      updateFormData({ organizationID: initialOrgID });
      onValidateStep(true);
      validatedRef.current = true;
    }
  }, [initialOrgID, updateFormData, onValidateStep]);

  // Détermine s'il y a une organisation pré-sélectionnée dans la liste
  const preselected = initialOrgID && organizations.length > 0
    ? organizations.find(o => o.organizationID === initialOrgID)
    : null;

  // Si pré-sélectionnée, affiche la vue en lecture seule
  if (preselected) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Créez un service pour {preselected.name}
        </h2>
        <div className="mt-4 p-4 border rounded-lg shadow-md flex items-center space-x-4">
          {/* <img
            alt={preselected.name}
            src={preselected.icon || ""}
            className="w-12 h-12 rounded-lg object-cover"
          /> */}
          <div>
            <h3 className="text-lg font-bold">{preselected.name}</h3>
            <p className="text-sm text-gray-600">{preselected.role}</p>
          </div>
        </div>
      </div>
    );
  }

  // Sinon, affiche l'interface de sélection
  const handleOrganizationSelect = (org: Organization) => {
    if (org.role === "Owner" || org.role === "Admin") {
      const orgID = org.organizationID || "";
      setSelectedOrganization(orgID);
      updateFormData({ organizationID: orgID });
      onValidateStep(true);
    } else {
      window.alert("Vous n'avez pas le droit de créer un service pour cette organisation");
    }
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgID = e.target.value;
    const org = organizations.find(o => o.organizationID === orgID);
    if (org) {
      if (org.role === "Owner" || org.role === "Admin") {
        setSelectedOrganization(orgID);
        updateFormData({ organizationID: orgID });
        onValidateStep(true);
      } else {
        window.alert("Vous n'avez pas le droit de créer un service pour cette organisation");
        setSelectedOrganization(null);
        onValidateStep(false);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Choisissez une organisation
      </h2>
      {loading ? (
        <div className="flex items-center">
          <div className="text-gray-700 text-lg">Chargement des organisations...</div>
        </div>
      ) : isMobile ? (
        <div className="w-full max-w-md">
          <select
            className="w-full p-3 border rounded-lg mb-4"
            value={selectedOrganization || ""}
            onChange={handleDropdownChange}
          >
            <option value="" disabled>
              -- Sélectionnez une organisation --
            </option>
            {organizations.map((org, index) => (
              <option
                key={org.organizationID || index}
                value={org.organizationID}
                disabled={!(org.role === "Owner" || org.role === "Admin")}
              >
                {org.name} {!(org.role === "Owner" || org.role === "Admin") ? "(non autorisé)" : ""}
              </option>
            ))}
          </select>
          {selectedOrganization && (() => {
            const org = organizations.find(o => o.organizationID === selectedOrganization);
            return org ? (
              <div className="mt-4 p-4 border rounded-lg shadow-md flex items-center space-x-4">
                <img
                  alt={org.name}
                  src={org.icon || ""}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold">{org.name}</h3>
                  <p className="text-sm text-gray-600">{org.role}</p>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      ) : (
        organizations.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            {organizations.map((org, index) => {
              const isAllowed = org.role === "Owner" || org.role === "Admin";
              return (
                <li
                  key={org.organizationID || index}
                  className={`relative flex flex-col items-center rounded-lg shadow-md border p-4
                    ${selectedOrganization === org.organizationID ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200"}
                    ${isAllowed ? "bg-white cursor-pointer" : "bg-gray-200 cursor-not-allowed"}`}
                  onClick={() => isAllowed && handleOrganizationSelect(org)}
                >
                  <img
                    alt={org.name}
                    src={org.icon || ""}
                    className="w-12 h-12 rounded-lg object-cover mb-2"
                  />
                  <h3 className="text-lg font-bold text-gray-900">{org.name}</h3>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
};

export default OrganizationSlide;
