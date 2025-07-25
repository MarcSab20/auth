'use client';

import React, { useState, useEffect } from 'react';
import { LocationData } from '@/context/update/service';
import { Input } from '@/src/components/catalyst/components/input';
import { Label } from '@/src/components/catalyst/components/label';
import { Divider } from '@/src/components/catalyst/components/divider';
import { Text } from '@/src/components/catalyst/components/text';

interface LocalisationSectionProps {
  formData: LocationData;
  handleChange: (field: keyof LocationData, value: any) => void;
}

const LocalisationSection: React.FC<LocalisationSectionProps> = ({ formData, handleChange }) => {
  const [addressLine1, setAddressLine1] = useState(formData.addressLine1 || '');
  const [city, setCity] = useState(formData.city || '');
  const [postalCode, setPostalCode] = useState(formData.postalCode || '');
  const [country, setCountry] = useState(formData.country || '');

  useEffect(() => {
    setAddressLine1(formData.addressLine1 || '');
    setCity(formData.city || '');
    setPostalCode(formData.postalCode || '');
    setCountry(formData.country || '');
  }, [formData]);

  const onAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressLine1(value);
    handleChange('addressLine1', value);
  };

  const onCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    handleChange('city', value);
  };

  const onPostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPostalCode(value);
    handleChange('postalCode', value);
  };

  const onCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountry(value);
    handleChange('country', value);
  };

  // Construire la requête d'adresse pour afficher la carte
  const addressQuery = addressLine1 || city || country || 'Paris';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(addressQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Adresse</Label>
          <Input
            type="text"
            name="addressLine1"
            value={addressLine1}
            onChange={onAddressChange}
            placeholder="Entrez l'adresse"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Ville</Label>
          <Input
            type="text"
            name="city"
            value={city}
            onChange={onCityChange}
            placeholder="Ville"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Code postal</Label>
          <Input
            type="text"
            name="postalCode"
            value={postalCode}
            onChange={onPostalCodeChange}
            placeholder="Code postal"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Pays</Label>
          <Input
            type="text"
            name="country"
            value={country}
            onChange={onCountryChange}
            placeholder="Pays"
            className="mt-1"
          />
        </div>
      </div>

      <Divider />

      <Label className="mb-2">Localisation sur la carte</Label>
      <div className="w-full h-64 border border-gray-300 rounded overflow-hidden">
        <iframe
          title="Google Map"
          src={mapSrc}
          className="w-full h-full"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default LocalisationSection;
