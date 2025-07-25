'use client';
import React from 'react';

interface PreferencesSectionProps {
  formData: {
    currency?: string;
    state?: string;
    advancedAttributes?: string;
  };
  handleChange: (field: 'currency' | 'state' | 'advancedAttributes', value: any) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({ formData, handleChange }) => {
  return (
    <div className=" mx-auto ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Devise</label>
            <select
              value={formData.currency || 'EUR'}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            >
              <option value="EUR">Euro (EUR)</option>
              {/* <option value="USD">Dollar américain (USD)</option>
              <option value="GBP">Livre sterling (GBP)</option>
              <option value="CAD">Dollar canadien (CAD)</option> */}
            </select>
          </div>
          
        </div>

      </div>
  );
};

export default PreferencesSection;
