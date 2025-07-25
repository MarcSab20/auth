'use client';

import React from 'react';
import { LocationData } from '@/context/update/service';
import { Input } from '@/src/components/catalyst/components/input';
import { Label } from '@/src/components/catalyst/components/label';

interface LocalisationSectionProps {
  formData: LocationData;
  handleChange: (field: keyof LocationData, value: any) => void;
}

const LocalisationSection: React.FC<LocalisationSectionProps> = ({ formData, handleChange }) => {
  // Construire l'URL de la carte directement à partir de formData
  const addressQuery = formData.addressLine1 || formData.city || formData.country || 'Paris';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(addressQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Adresse</Label>
          <Input
            name="addressLine1"
            value={formData.addressLine1 || ''}
            onChange={(e) => handleChange('addressLine1', e.target.value)}
            placeholder="Entrez l'adresse"
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Ville</Label>
            <Input
              name="city"
              value={formData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Ville"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Code postal</Label>
            <Input
              name="postalCode"
              value={formData.postalCode || ''}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              placeholder="Code postal"
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label>Pays</Label>
          <select
            name="country"
            value={formData.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 dark:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="" disabled>
              Sélectionner un pays
            </option>
            <option value="France">France</option>
            <option value="Cameroun">Cameroun</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
            <option value="Canada">Canada</option>
          </select>
        </div>
      </div>
      <div>
        <Label className="mb-2">Localisation sur la carte</Label>
        <div className="w-full h-64 border border-gray-300 rounded">
          <iframe
            title="Google Map"
            src={mapSrc}
            className="w-full h-full rounded"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default LocalisationSection;
