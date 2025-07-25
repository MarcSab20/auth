// src/components/dashboard/asset/creationSlides/organizationAssetSlide.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAssetContext } from "@/context/create/createAssetContext";

export interface Organization {
  organizationID?: string;
  name: string;
  icon?: string;
  role?: "Owner" | "Admin" | "Guest" | "Member";
  organizationType?: string;
}

interface Props {
  onValidateStep: (isValid: boolean) => void;
  organizations: Organization[];
  loading: boolean;
  organizationID?: string | null;
}

const OrganizationAssetSlide: React.FC<Props> = ({
  onValidateStep,
  organizations,
  loading,
  organizationID,
}) => {
  const { formData, updateFormData } = useAssetContext();
  const initialOrgID = organizationID || formData.organizationID || null;
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(initialOrgID);
  const [isMobile, setIsMobile] = useState(false);
  const validatedRef = useRef(false);

  // responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // invalide tant que loading ou pas d’orga
  useEffect(() => {
    if (loading || organizations.length === 0) {
      onValidateStep(false);
    }
  }, [loading, organizations, onValidateStep]);

  // auto‑validate si déjà pré‑sélectionnée
  useEffect(() => {
    if (initialOrgID && !validatedRef.current) {
      setSelectedOrganization(initialOrgID);
      updateFormData({ organizationID: initialOrgID });
      onValidateStep(true);
      validatedRef.current = true;
    }
  }, [initialOrgID, updateFormData, onValidateStep]);

  // si on a déjà l’orga, vue read‑only
  const pre = initialOrgID
    ? organizations.find((o) => o.organizationID === initialOrgID)
    : null;

  if (pre) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Création d’asset pour {pre.name}
        </h2>
        <div className="p-4 border rounded-lg shadow-md flex items-center space-x-4">
          {pre.icon && (
            <img
              src={pre.icon}
              alt={pre.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-bold">{pre.name}</h3>
            <p className="text-sm text-gray-600">{pre.role}</p>
          </div>
        </div>
      </div>
    );
  }

  // sinon, sélection manuelle
  const handleSelect = (org: Organization) => {
    if (org.role === "Owner" || org.role === "Admin") {
      const id = org.organizationID || "";
      setSelectedOrganization(id);
      updateFormData({ organizationID: id });
      onValidateStep(true);
    } else {
      window.alert("Droits insuffisants pour cette organisation");
      onValidateStep(false);
    }
  };

  const handleDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const org = organizations.find((o) => o.organizationID === id);
    if (org) handleSelect(org);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
        Choisissez une organisation
      </h2>

      {loading ? (
        <span className="text-gray-700">Chargement des organisations…</span>
      ) : isMobile ? (
        <div className="w-full max-w-md">
          <select
            className="w-full p-3 border rounded-lg mb-4"
            value={selectedOrganization || ""}
            onChange={handleDropdown}
          >
            <option value="" disabled>
              -- Sélectionnez une organisation --
            </option>
            {organizations.map((org, i) => (
              <option
                key={org.organizationID ?? i}
                value={org.organizationID}
                disabled={!(org.role === "Owner" || org.role === "Admin")}
              >
                {org.name}
                {org.role !== "Owner" && org.role !== "Admin" && " (non autorisé)"}
              </option>
            ))}
          </select>

          {selectedOrganization && (
            <div className="p-4 border rounded-lg shadow-md flex items-center space-x-4">
              <img
                src={
                  organizations.find((o) => o.organizationID === selectedOrganization)
                    ?.icon || ""
                }
                alt=""
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h3 className="text-lg font-bold">
                  {
                    organizations.find((o) => o.organizationID === selectedOrganization)
                      ?.name
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {
                    organizations.find((o) => o.organizationID === selectedOrganization)
                      ?.role
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {organizations.map((org, i) => {
            const ok = org.role === "Owner" || org.role === "Admin";
            return (
              <li
                key={org.organizationID ?? i}
                className={`
                  flex flex-col items-center p-4 border rounded-lg transition
                  ${
                    selectedOrganization === org.organizationID
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-gray-200"
                  }
                  ${ok ? "bg-white cursor-pointer hover:shadow-md" : "bg-gray-100 cursor-not-allowed"}
                `}
                onClick={() => ok && handleSelect(org)}
              >
                {org.icon && (
                  <img
                    src={org.icon}
                    alt={org.name}
                    className="w-12 h-12 rounded-lg object-cover mb-2"
                  />
                )}
                <h3 className="text-lg font-bold">{org.name}</h3>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OrganizationAssetSlide;
