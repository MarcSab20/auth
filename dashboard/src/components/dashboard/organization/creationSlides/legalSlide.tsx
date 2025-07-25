"use client";

import React, { useState, useEffect } from "react";
import { useOrganizationContext } from "@/context/create/createOrganizationContext";
import { Input } from "@/src/components/catalyst/components/input";

interface LegalSlideProps {
  onValidateStep: (isValid: boolean) => void;
}

const LegalSlide: React.FC<LegalSlideProps> = ({ onValidateStep }) => {
  const { formData, updateFormData } = useOrganizationContext();

  const [formValues, setFormValues] = useState({
    juridicForm: formData.juridicForm || "",
    vatNumber: formData.vatNumber || "",
    communityVATNumber: formData.communityVATNumber || "",
    capital: formData.capital ? formData.capital.toString() : "",
    insuranceRef: formData.insuranceRef || "",
    insuranceName: formData.insuranceName || "",
    oSize: formData.oSize || "",
    legalName: formData.legalName || "",
    siret: formData.legalUniqIdentifier || "",
  });

  const [errors, setErrors] = useState({
    legalName: "",
    siret: "",
    capital: "",
  });

  useEffect(() => {
    const validateFields = () => {
      const newErrors = {
        legalName: "",
        siret: "",
        capital: "",
      };
      if (!formValues.legalName.trim()) {
        newErrors.legalName = "Le nom légal est obligatoire.";
      }
      if (!formValues.siret.trim()) {
        newErrors.siret = "Le SIRET est obligatoire.";
      }
      if (formValues.capital && isNaN(Number(formValues.capital))) {
        newErrors.capital = "Le capital doit être un nombre valide.";
      }
      setErrors(newErrors);

      const isValid = Object.values(newErrors).every((error) => error === "");
      onValidateStep(isValid);
    };

    validateFields();

    updateFormData({
      ...formValues,
      capital: formValues.capital ? parseFloat(formValues.capital) : undefined,
    });
  }, [formValues, updateFormData, onValidateStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "capital" ? value.replace(/[^\d.]/g, "") : value,
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Informations légales
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Forme juridique
          </label>
          <Input
            type="text"
            name="juridicForm"
            value={formValues.juridicForm}
            onChange={handleChange}
            placeholder="Ex : SARL, SAS, SCI"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Numéro TVA</label>
          <Input
            type="text"
            name="vatNumber"
            value={formValues.vatNumber}
            onChange={handleChange}
            placeholder="Ex : FR12345678901"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Capital (€)</label>
          <Input
            type="text"
            name="capital"
            value={formValues.capital}
            onChange={handleChange}
            placeholder="Ex : 10000"
            className={errors.capital ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}
            aria-invalid={!!errors.capital}
          />
          {errors.capital && <p className="text-sm text-red-500 mt-1">{errors.capital}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Réf. d'assurance</label>
          <Input
            type="text"
            name="insuranceRef"
            value={formValues.insuranceRef}
            onChange={handleChange}
            placeholder="Ex : REF123456"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nom légal <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="legalName"
            value={formValues.legalName}
            onChange={handleChange}
            placeholder="Ex : Société ABC"
            className={errors.legalName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}
            aria-invalid={!!errors.legalName}
          />
          {errors.legalName && <p className="text-sm text-red-500 mt-1">{errors.legalName}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Taille économique</label>
          <select
            name="oSize"
            value={formValues.oSize}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionnez une option</option>
            <option value="freelancer">Freelance</option>
            <option value="holding">Holding</option>
            {/* <option value="pme">PME</option>
            <option value="grande">Grande Entreprise</option> */}
            <option value="division">Division</option>
            <option value="eti"> ETI</option>

          </select>
        </div>
      </div>
    </div>
  );
};

export default LegalSlide;
