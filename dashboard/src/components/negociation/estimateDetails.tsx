"use client";
import React, { useState, useEffect } from 'react';
import { usePayment } from '@/context/payment/paymentContext';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import SMPNotification from '@/src/components/notification';
import { Button } from '@/src/components/landing-page/Button';
import { 
  EstimateService, 
  EstimateItem,
  EstimateAddress 
} from "@/context/payment/paymentTypes";

// Style commun pour les icônes Heroicons
const iconStyle = { fill: "none", background: "transparent" };

// Interface pour les détails de l'estimation
interface IEstimateDetails {
  services: EstimateService[];
  to: EstimateAddress;
  from: EstimateAddress;
  estimateNumber: string;
  issueDate: string;
  validUntil: string;
  tax: number;
  subTotal: number;
  total: number;
  items: EstimateItem[];
  actions: any[];
  isNegotiable: boolean;
  status: string;
}

// Propriétés de EstimateDetails
export interface EstimateDetailsProps {
  estimate?: {
    estimateId: string;
    details: IEstimateDetails;
  };
}

interface EstimateDetailsComponentProps {
  estimate: any;
  validationState?: "initial" | "error";
}

export default function EstimateDetails({ estimate, validationState = "initial" }: EstimateDetailsComponentProps) {
  const { actions } = usePayment();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  console.log('Props reçues:', estimate);

  // Transformer l'objet estimate en props si fourni
  const detailsProps: IEstimateDetails = {
    services: estimate?.details?.services || [],
    to: estimate?.details?.to || {
      name: '',
      address: '',
      email: '',
      phone: ''
    },
    from: estimate?.details?.from || {
      name: '',
      address: '',
      email: '',
      phone: ''
    },
    estimateNumber: estimate?.details?.estimateNumber || '',
    issueDate: estimate?.details?.issueDate || '',
    validUntil: estimate?.details?.validUntil || '',
    tax: estimate?.details?.tax || 0,
    subTotal: estimate?.details?.subTotal || 0,
    total: estimate?.details?.total || 0,
    items: estimate?.details?.items || [],
    actions: estimate?.details?.actions || [],
    isNegotiable: estimate?.details?.isNegotiable || false,
    status: estimate?.details?.status || 'DRAFT'
  };

  console.log('Details props après transformation:', detailsProps);

  const [services, setServices] = useState<EstimateService[]>(detailsProps.services || []);
  const [clientInfo, setClientInfo] = useState<EstimateAddress>({
    name: detailsProps.to.name,
    address: detailsProps.to.address,

  });
  const [isEditingClient, setIsEditingClient] = useState(false);

  // Effet pour mettre à jour les services quand les props changent
  useEffect(() => {
    if (estimate?.details) {
      setServices(estimate.details.services);
      setClientInfo({
        name: estimate.details.to?.name || '',
        address: estimate.details.to?.address || '',
        email: estimate.details.to?.email || '',
        phone: estimate.details.to?.phone || ''
      });
    }
  }, [estimate]);

  // Calcul des totaux
  const calculateTotals = (services: EstimateService[]) => {
    const subTotal = services.reduce((total, service) => {
      const itemsTotal = service.items.reduce((sum, item) => 
        sum + (item.quantity * (item.unitPrice ?? 0)), 0);
      return total + service.price + itemsTotal;
    }, 0);

    const total = subTotal * (1 + detailsProps.tax / 100);
    return { subTotal, total };
  };

  // Fonction pour mettre à jour l'estimate sur le serveur
  const updateEstimate = async (updatedServices: EstimateService[], updatedClientInfo = clientInfo) => {
    const estimateId = estimate?.estimateId || detailsProps.estimateNumber;
    
    if (!estimateId) {
      console.log('Aucun ID d\'estimation trouvé');
      return;
    }

    const { subTotal, total } = calculateTotals(updatedServices);

    const payload = {
      updateEstimateId: estimateId,
      data: {
        estimateId,
        proposalPrice: 0,
        details: {
          services: updatedServices,
          to: {
            name: updatedClientInfo.name,
            address: updatedClientInfo.address,
            email: updatedClientInfo.email,
            phone: updatedClientInfo.phone
          },
          from: detailsProps.from,
          estimateNumber: detailsProps.estimateNumber,
          issueDate: detailsProps.issueDate,
          validUntil: detailsProps.validUntil,
          tax: detailsProps.tax,
          subTotal,
          total
        }
      }
    };

    try {
      const response = await fetch('/api/payment/estimate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await actions.updateEstimateFlow();
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return false;
    }
  };

  // Gestion du changement de quantité
  const handleQuantityChange = async (serviceIndex: number, itemIndex: number, newQuantity: number) => {
    const updatedServices = [...services];
    const item = updatedServices[serviceIndex].items[itemIndex];
    
    // Si la nouvelle quantité est 0 ou moins, proposer de supprimer l'item
    if (newQuantity < 1) {
      if (window.confirm('Voulez-vous supprimer cet élément ?')) {
        handleDeleteItem(serviceIndex, item.id);
      }
      return;
    }
    
    item.quantity = newQuantity;
    setServices(updatedServices);
    
    try {
      const success = await updateEstimate(updatedServices);
      setNotificationMessage(success ? 'Quantité mise à jour avec succès' : 'Erreur lors de la mise à jour');
      setShowNotification(true);
    } catch (error) {
      setNotificationMessage('Erreur lors de la mise à jour');
      setShowNotification(true);
    }
  };

  // Gestion de la suppression d'un item
  const handleDeleteItem = async (serviceIndex: number, itemId: string) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex].items = updatedServices[serviceIndex].items.filter(
      (item: EstimateItem) => item.id !== itemId
    );
    
    setServices(updatedServices);

    try {
      const success = await updateEstimate(updatedServices);
      setNotificationMessage(success ? 'Article supprimé avec succès' : 'Erreur lors de la suppression');
      setShowNotification(true);
    } catch (error) {
      setNotificationMessage('Erreur lors de la suppression');
      setShowNotification(true);
    }
  };

  // Gestion de la mise à jour des informations client
  const handleClientUpdate = async (field: 'name' | 'address' | 'email' | 'phone', value: string) => {
    const updatedClientInfo = { ...clientInfo, [field]: value };
    setClientInfo(updatedClientInfo);
    setIsEditingClient(false);

    try {
      const success = await updateEstimate(services, updatedClientInfo);
      setNotificationMessage(success ? 'Informations client mises à jour' : 'Erreur lors de la mise à jour');
      setShowNotification(true);
    } catch (error) {
      setNotificationMessage('Erreur lors de la mise à jour');
      setShowNotification(true);
    }
  };

  const handleSaveClient = async () => {
    try {
      const success = await updateEstimate(services, clientInfo);
      setNotificationMessage(success ? 'Informations client mises à jour' : 'Erreur lors de la mise à jour');
      setShowNotification(true);
    } catch (error) {
      setNotificationMessage('Erreur lors de la mise à jour');
      setShowNotification(true);
    }
  };

  const getBorderStyle = () => {
    switch (validationState) {
      case "error":
        return "border-red-500";
      case "initial":
        return "border-blue-300";
      default:
        return "border-gray-300";
    }
  };

  return (
    <div className=" ">
      <SMPNotification
        type="success"
        message={notificationMessage}
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <div className="text-sm text-gray-500">Devis #{detailsProps.estimateNumber}</div>

      <div className="bg-white">
        {/* En-tête avec dates */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-sm">
            <div>Émis le : {new Date(detailsProps.issueDate).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="flex justify-between mb-8 text-sm">
          <div>
            <div className="font-medium">{detailsProps.from.name}</div>
            <div className="text-gray-600">{detailsProps.from.address}</div>
            
          </div>
          <div className="text-right bg-gray-50 p-3 rounded">
            {isEditingClient ? (
              <div>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  className={`w-full mb-2 p-2 border rounded ${!clientInfo.name ? getBorderStyle() : 'border-gray-300'}`}
                  placeholder="Nom du client"
                />
                <input
                  type="text"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                  className={`w-full p-2 border rounded ${!clientInfo.address ? getBorderStyle() : 'border-gray-300'}`}
                  placeholder="Adresse de facturation"
                />
                <div className="mt-2">
                  <Button
                    onClick={handleSaveClient}
                    className="bg-black text-white px-4 py-1 rounded mr-2"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    onClick={() => setIsEditingClient(false)}
                    className="text-gray-600"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingClient(true)}
                className={`cursor-pointer ${(!clientInfo.name || !clientInfo.address) ? `border-2 ${getBorderStyle()} rounded p-2` : ''}`}
              >
                <div className="font-medium">{clientInfo.name || "Cliquez pour ajouter le nom"}</div>
                <div className="text-gray-600">{clientInfo.address || "Cliquez pour ajouter l'adresse"}</div>
                <div className="text-sm text-gray-500 mt-1">
                  <PencilIcon className="h-4 w-4 inline-block" style={iconStyle} /> Modifier
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services et leurs items */}
        <div className="space-y-4">
          {services.map((service: EstimateService, serviceIndex: number) => (
            <div key={service.serviceID} className="border border-gray-100 rounded-lg overflow-hidden">
              {/* En-tête du service */}
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <h3 className="font-medium text-base">{service.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                <p className="text-sm mt-3">Prix de base: <span className="font-bold text-grey">{service.price.toLocaleString('fr-FR')} €</span></p>
              </div>

              {/* Tableau des items du service */}
              <div className="px-4">
                <table className="w-full text-sm">
                  <colgroup>
                    <col className="w-[45%]" />
                    <col className="w-[15%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[5%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 text-left font-medium">Options</th>
                      <th className="py-2 text-center font-medium">Qté</th>
                      <th className="py-2 text-right font-medium pr-8">PU (€)</th>
                      <th className="py-2 text-right font-medium pr-8">Total (€)</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.items.map((item: EstimateItem, itemIndex: number) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="py-2">
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <div className="text-gray-500 text-xs line-clamp-2">{item.description}</div>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(serviceIndex, itemIndex, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(serviceIndex, itemIndex, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2 text-right pr-8">{(item.unitPrice ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 text-right pr-8">{(item.quantity * (item.unitPrice ?? 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2 text-center">
                          <button
                            onClick={() => handleDeleteItem(serviceIndex, item.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <TrashIcon className="h-5 w-5" style={iconStyle} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Total du service avec prix de base */}
                    <tr className="border-t border-gray-100">
                      <td colSpan={3} className="py-2 text-right font-medium pr-8">Total du service (avec prix de base)</td>
                      <td className="py-2 text-right font-medium pr-8">
                        {(service.price + service.items.reduce((sum, item) => sum + (item.quantity * (item.unitPrice ?? 0)), 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="border-t border-gray-100 mt-8 pt-4">
          <div className="flex justify-end text-sm">
            <table className="w-64">
              <tbody>
                <tr>
                  <td className="py-2 text-right font-medium">Sous-total</td>
                  <td className="py-2 text-right pl-4">{calculateTotals(services).subTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                </tr>
                <tr>
                  <td className="py-2 text-right font-medium">TVA ({detailsProps.tax}%)</td>
                  <td className="py-2 text-right pl-4">
                    {(calculateTotals(services).subTotal * detailsProps.tax / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="py-2 text-right font-bold">Total</td>
                  <td className="py-2 text-right pl-4 font-bold">
                    {calculateTotals(services).total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Termes et conditions */}
        <div className="mt-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
          <h3 className="font-medium mb-2">Termes et conditions</h3>
          <p>
            Les paiements doivent être effectués dans les délais spécifiés. Les paiements tardifs peuvent entraîner des frais supplémentaires.
          </p>
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour transformer l'objet estimate en props attendues
export function transformEstimateToDetailsProps(estimate: any): IEstimateDetails {
  return {
    services: estimate.services?.map((service: any) => ({
      serviceID: service.serviceID || '',
      title: service.title || '',
      description: service.description || '',
      price: service.price || 0,
      items: service.items?.map((item: any) => ({
        id: item.id || '',
        title: item.title || '',
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        total: item.total || '0'
      })) || [],
      actions: service.actions || [],
      isNegotiable: service.isNegotiable || false,
      status: service.status || 'DRAFT'
    })) || [],
    from: {
      id: estimate.from?.id || '',
      name: estimate.from?.name || '',
      address: estimate.from?.address || '',

    },
    to: {
      name: estimate.to?.name || '',
      address: estimate.to?.address || '',
    
    },
    estimateNumber: estimate.estimateNumber || '',
    issueDate: estimate.issueDate || '',
    validUntil: estimate.validUntil || '',
    tax: estimate.tax || 0,
    subTotal: estimate.subTotal || 0,
    total: estimate.total || 0,
    items: estimate.items || [],
    actions: estimate.actions || [],
    isNegotiable: estimate.isNegotiable || false,
    status: estimate.status || 'DRAFT'
  };
}
