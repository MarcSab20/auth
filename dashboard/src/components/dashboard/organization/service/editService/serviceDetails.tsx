'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heading } from '@/src/components/catalyst/components/heading';
import { Badge } from '@/src/components/catalyst/components/badge';
import { Button } from '@/src/components/landing-page/Button';
import { Divider } from '@/src/components/catalyst/components/divider';
import { Link } from '@/src/components/catalyst/components/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/catalyst/components/table';
import ServiceTabs from './serviceTab';
import ServiceImageManager from './medias';
import PriceSection from './tab/priceSection';
import DetailsSection from './tab/detailsSection';
import LocalisationSection from './tab/locationSection';
import DescriptionSection from './tab/descriptionSection';
import TagsSection from './tab/tagsSection';
import AssetsSection from './tab/assetsSection';
import { FrenchDate } from '@/src/components/frenchDate';

import {
  useUpdateServiceContext,
  ServiceData,
  LocationData,
  ServiceMediaInfo,
} from '@/context/update/service';
 
interface Order {
  id: number;
  date: string;
  customer: { name: string };
  amount: { usd: number };
  url: string;
}

export interface ServiceDataProps {
  serviceID: string;
  title: string;
  description?: string;
  state: string;
  mediaBannerID?: string;
  price: number;
  lowerPrice?: number;
  upperPrice?: number;
  legalVatPercent?: number;
  createdAt?: string;
  updatedAt?: string;
  negotiable?: boolean;
  supplyType?: string;
  uptakeForm?: string;
  billingPlan?: string;
  onlineService?: boolean;
  images?: string[];
  serviceMedias?: Array<ServiceMediaInfo & {
    mediaID: string;
    media: {
      mediaID: string;
      url: string;
      [key: string]: any;
    };
  }>;
  advancedAttributes?: string;
  locationID?: string;
}

interface ServiceDetailClientProps {
  service: ServiceDataProps;
  orders: Order[];
  organizationID: string;
  onSuccessUpdate?: () => void;
}

export default function ServiceDetailClient({
  service,
  orders,
  organizationID,
  onSuccessUpdate = () => {},
}: ServiceDetailClientProps) {
  // Récupération du contexte d'update
  const {
    serviceFormData,
    locationFormData,
    initialServiceData,
    initialLocationData,
    initializeDataFromProps,
    updateServiceForm,
    updateLocationForm,
    submitUpdates,
    isDirty
  } = useUpdateServiceContext();

  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState<string>('details');
  // Notifications
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationDescription, setNotificationDescription] = useState('');

  // Initialisation : on charge les données du service dans le contexte
  useEffect(() => {
    // Convertir les serviceMedias au bon format
    const convertedServiceMedias = service.serviceMedias?.map(sm => ({
      serviceMediaID: sm.serviceMediaID,
      listingPosition: sm.listingPosition,
      url: sm.media?.url || '',
      legend: sm.legend,
      mediaID: sm.mediaID,
      isNew: false,
      toDelete: false
    })) || [];

    const { images, ...serviceWithoutImages } = service; // Exclure images
    const serviceWithMedias = {
      ...serviceWithoutImages,
      serviceMedias: convertedServiceMedias
    };

    initializeDataFromProps(serviceWithMedias);
  }, [service, initializeDataFromProps]);

  const handleServiceChange = (field: keyof ServiceData, value: any) => {
    updateServiceForm({ [field]: value });
  };

  const handleLocationChange = (field: keyof LocationData, value: any) => {
    updateLocationForm({ [field]: value });
  };

  const handleSave = async () => {
    try {
      await submitUpdates();
      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Service mis à jour avec succès');
      setNotificationDescription('Vos modifications ont été enregistrées.');
      onSuccessUpdate();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du service:", error);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Erreur lors de la mise à jour');
      setNotificationDescription(String(error));
    }
  };

  // Si aucune image n'est définie, on utilise des images "mock"
  const mockImages = [
    "https://placehold.co/550x350?text=Mock+1",
    "https://placehold.co/550x350?text=Mock+2",
    "https://placehold.co/550x350?text=Mock+3",
    "https://placehold.co/550x350?text=Mock+4",
    "https://placehold.co/550x350?text=Mock+5",
    "https://placehold.co/550x350?text=Mock+6",
  ];
  const imagesToShow = service.images && service.images.length > 0 ? service.images : mockImages;

  return (
    <motion.div
      className="space-y-8 px-6 py-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Bouton de retour */}
      <div>
        <Link href={`/account/o/${organizationID}/services`} className="hover:underline text-sm text-zinc-600">
          ← Retour
        </Link>
      </div>

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Heading level={2}>{service.title || 'Service sans titre'}</Heading>
          {/* <Badge color={service.state === 'online' ? 'green' : 'red'}>
            {service.state === 'online' ? 'Actif' : 'Inactif'}
          </Badge> */}
          <Badge color= 'green' >
             Actif 
          </Badge>
        </div>
       
      </div>

      {/* Image du service */}
      {service.mediaBannerID && (
        <div className="w-full max-w-3xl">
          <img src={service.mediaBannerID} alt={service.title} className="rounded shadow-sm" />
        </div>
      )}

      {/* Gestion des images avec ServiceImageManager */}
      <div className="mt-6">
        <ServiceImageManager
          serviceID={service.serviceID}
          organizationID={organizationID}
          maxImages={6}
        />
      </div>

      {/* Onglets */}
      <div className="mt-2 text-sm text-zinc-500">
        Créé le <FrenchDate date={service.createdAt} /> <span aria-hidden="true">·</span> France
      </div>

      <Divider />
    
      <ServiceTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenu de l'onglet actif */}
      <div className="mt-4">
        {activeTab === 'prix' && (
          <PriceSection
            formData={{
              price: serviceFormData.price,
              lowerPrice: serviceFormData.lowerPrice,
              upperPrice: serviceFormData.upperPrice,
              legalVatPercent: serviceFormData.legalVatPercent,
            }}
            handleChange={handleServiceChange}
          />
        )}
        {activeTab === 'details' && (
          <DetailsSection
            formData={{
              title: serviceFormData.title,
              legalVatPercent: serviceFormData.legalVatPercent ?? 0,
              lowerPrice: serviceFormData.lowerPrice ?? 0,
              upperPrice: serviceFormData.upperPrice ?? 0,
              negotiable: serviceFormData.negotiable ?? false,
              supplyType: serviceFormData.supplyType ?? "",
              uptakeForm: serviceFormData.uptakeForm ?? "",
              billingPlan: serviceFormData.billingPlan ?? "",
              onlineService: serviceFormData.onlineService ?? false,
              advancedAttributes: serviceFormData.advancedAttributes || ""
            }}
            handleChange={handleServiceChange}
          />
        )}
        {activeTab === 'localisation' && (
          <LocalisationSection
            formData={locationFormData}
            handleChange={handleLocationChange}
          />
        )}
        {activeTab === 'description' && (
          <DescriptionSection
            formData={{ description: serviceFormData.description }}
            handleChange={handleServiceChange}
          />
        )}
        {activeTab === 'tags' && (
          <TagsSection
            formData={{ advancedAttributes: serviceFormData.advancedAttributes || "" }}
            handleChange={(field, value) =>
              handleServiceChange(field as keyof ServiceData, value)
            }
          />
        )}
        {activeTab === 'assets' && (
          <AssetsSection  serviceID={serviceFormData.serviceID!} organizationID={organizationID} />
        )}
      </div>

      {/* Bouton de sauvegarde avec indicator dirty */}
      <div className="pt-6 flex justify-end">
        <Button
          disabled={!isDirty}
          onClick={handleSave}
          className={`px-6 py-2 rounded-md ${
            isDirty
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-300 text-gray-700 cursor-not-allowed"
          }`}
        >
          {isDirty ? 'Sauvegarder les modifications' : 'Aucune modification'}
        </Button>
      </div>

      <Divider />

      {/* Liste des commandes récentes */}
      <Heading level={3}>Commandes récentes</Heading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Order ID</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Client</TableHeader>
            <TableHeader className="text-right">Montant</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} href={order.url} title={`Order #${order.id}`}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.customer.name}</TableCell>
              <TableCell className="text-right">{order.amount.usd} €</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      
    </motion.div>
  );
}
