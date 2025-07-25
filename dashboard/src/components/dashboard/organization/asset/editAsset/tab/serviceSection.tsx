// src/components/update/asset/tab/servicesSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/catalyst/components/input';
import { Select } from '@/src/components/catalyst/components/select';
import { Heading } from '@/src/components/catalyst/components/heading';

interface Service {
  serviceID: string;
  title: string;
  description: string;
  state: string;
  mediaBannerID?: string;
  createdAt: string;
  serviceAssetID: string;
}

interface ServicesSectionProps {
  assetID: string;
  organizationID: string;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ assetID, organizationID }) => {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/assets/${assetID}/services`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des services');
        const data = await response.json();
        setServices(data || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [assetID]);

  const filteredServices = services.filter(service => {
    const matchesSearch = (service.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (service.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesState = stateFilter === 'all' || service.state === stateFilter;
    return matchesSearch && matchesState;
  });

  const handleServiceClick = (serviceID: string) => {
    router.push(`/account/o/${organizationID}/services/${serviceID}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Rechercher un service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="all">Tous les états</option>
          <option value="online">Actif</option>
          <option value="offline">Inactif</option>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Chargement des services...</p>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <motion.div
              key={service.serviceID}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
              onClick={() => handleServiceClick(service.serviceID)}
            >
              <div className="h-40 overflow-hidden">
                {service.mediaBannerID ? (
                  <img
                    src={service.mediaBannerID}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Aucune image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{service.title || 'Sans titre'}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{service.description || 'Aucune description'}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    service.state === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.state === 'online' ? 'Actif' : 'Inactif'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Créé le {new Date(service.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {searchTerm || stateFilter !== 'all' 
            ? 'Aucun service ne correspond aux critères de recherche'
            : 'Aucun service lié à cet asset'}
        </p>
      )}
    </div>
  );
};

export default ServicesSection;
