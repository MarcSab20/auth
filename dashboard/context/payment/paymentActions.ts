import { PaymentState, CreatePaymentDto, EstimateDetails, Order } from './paymentTypes';
import { SMPUser } from '@/context/authenticationContext';
import React, { useRef } from 'react';
import { PaymentAction } from './paymentTypes';

// Fonctions utilitaires
const updateEstimate = async (estimate: EstimateDetails): Promise<EstimateDetails> => {
  const response = await fetch('/api/payment/estimate', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estimate)
  });
  if (!response.ok) throw new Error('Failed to update estimate');
  return response.json();
};

// const createOrder = async (estimate: EstimateDetails): Promise<Order> => {
//   const response = await fetch('/api/payment/order', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ estimate })
//   });
//   if (!response.ok) throw new Error('Failed to create order');
//   return response.json();
// };

export const createPaymentActions = (
  state: PaymentState,
  user: SMPUser | null,
  isPendingRef: React.MutableRefObject<boolean>,
  dispatch: React.Dispatch<PaymentAction>
) => {
  // Créer un identifiant unique de session pour éviter les créations multiples
  const sessionId = typeof window !== 'undefined' ? window.sessionStorage.getItem('payment-session-id') || Date.now().toString() : Date.now().toString();
  
  if (typeof window !== 'undefined' && !window.sessionStorage.getItem('payment-session-id')) {
    window.sessionStorage.setItem('payment-session-id', sessionId);
  }

  // Initie une transaction au début du processus de paiement
  const initiateTransactionFlow = async () => {
    // Si une transaction existe déjà dans le state et est en état PENDING ou INITIATED, la retourner
    if (state.transaction?.transactionId && (state.transaction.status === 'PENDING' || state.transaction.status === 'INITIATED')) {
      console.log('[Payment] Valid transaction already exists:', state.transaction.transactionId);
      return state.transaction;
    
    }
    
    // Vérifier dans sessionStorage aussi pour éviter les doublons
    const existingTransactionId = typeof window !== 'undefined' ? window.sessionStorage.getItem(`transaction-${sessionId}`) : null;
    if (existingTransactionId) {
      console.log('[Payment] Found existing transaction in session:', existingTransactionId);
      // Retourner directement la transaction trouvée sans faire de GET
      return { 
        transactionId: existingTransactionId, 
        serviceId: state.service?.id || '', 
        status: 'PENDING' 
      };
    }
    
    if (isPendingRef.current) {
      console.log('[Payment] Transaction creation already pending');
      return null;
    }
    
    isPendingRef.current = true;
    try {
      console.log('[Payment] Creating new transaction with sessionId:', sessionId);
      if (!state.service) return null;
      
      const response = await fetch('/api/payment/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: state.service.id,
          sellerOrganizationId: state.service.organizationId,
          currency: 'EUR',
          buyerUserId: user?.userID || "0",
          buyerOrganizationId: "0",
          totalAmount: state.service.price,
          sellerUserContactId: "seller_contact_id",
          metadata: JSON.stringify({ sessionId })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate transaction');
      }

      if (!data.transactionId) {
        throw new Error('Invalid transaction response');
      }

      // Sauvegarder l'ID de transaction dans sessionStorage
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(`transaction-${sessionId}`, data.transactionId);
      }

      return data;
    } catch (error: any) {
      console.error('Transaction error details:', error);
      throw error;
    } finally {
      isPendingRef.current = false;
    }
  };

  // Crée l'estimate et l'order quand l'utilisateur clique sur "Suivant" dans le summary
  const createEstimateAndOrder = async () => {
    if (!state.service || !state.transaction || !state.billingProfile) return;

    console.log('[Payment] createEstimateAndOrder called', { service: state.service, transaction: state.transaction, billingProfile: state.billingProfile });

    // 1. Créer l'estimate avec les données du draft
    const estimateInput = {
      serviceId: state.service.id,
      proposalPrice: state.service.price,
      details: {
        services: [{
          serviceID: state.service.serviceID,
          title: state.service.title,
          description: state.service.description || '',
          price: state.service.price
        }],
        items: state.selectedAssets.map(asset => ({
          assetID: asset.assetID,
          title: asset.title,
          description: asset.description || '',
          quantity: asset.quantity || 1,
          price: asset.price
        })),
        from: {
          name: "Service Provider",
          address: ""
        },
        to: {
          name: state.billingProfile.name,
          address: state.billingProfile.address
        }
      }
    };

    console.log('[Payment] Creating estimate with input:', estimateInput);
    const estimateResponse = await fetch('/api/payment/estimate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estimateInput),
    });

    // Log la réponse brute
    const estimateRaw = await estimateResponse.clone().text();
    console.log('[Payment] Raw estimate response:', estimateRaw);

    if (!estimateResponse.ok) {
      console.error('[Payment] Estimate creation failed:', estimateRaw);
      throw new Error('Failed to create estimate');
    }
    const estimate = JSON.parse(estimateRaw);
    console.log('[Payment] Estimate created:', estimate);

    console.log('[Payment]transactionId', state.transaction.transactionId);
    // 2. Créer l'order avec les données de l'estimate
    const orderInput = {
      serviceId: state.service.id,
      quoteId: estimate.estimateId,
      totalPrice: estimate.details.total,
      sellerOrganizationId: state.service.organizationId,
      buyerOrganizationId: "0",
      currency: 'EUR',
      transactionId: state.transaction.transactionId
    };
    console.log('[Payment] Creating order with input:', orderInput);
    const orderResponse = await fetch('/api/payment/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderInput),
    });
    if (!orderResponse.ok) throw new Error('Failed to create order');
    const order = await orderResponse.json();
    console.log('[Payment] Order created:', order);
    // 3. Ajouter les lines à l'order basées sur les items de l'estimate
    const lines = (estimate.details.services as Array<any>).flatMap((service: any) =>
      (service.items as Array<any> || []).map((item: any) => ({
        assetId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        title: item.title,
        description: item.description,
        legalVatPercent: 20 // ou autre valeur selon le service
      }))
    );
    const addLinesPromises = lines.map(async (line: any) => {
      const lineInput = {
        orderAssetId: line.assetId,
        assetId: line.assetId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        title: line.title,
        description: line.description,
        legalVatPercent: line.legalVatPercent,
        details: {}
      };
      const lineResponse = await fetch(`/api/payment/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.orderId,
          lineInput
        }),
      });
      if (!lineResponse.ok) throw new Error(`Failed to add line for asset ${line.assetId}`);
      return lineResponse.json();
    });
    await Promise.all(addLinesPromises);
    return { estimate, order };
    return { estimate };
  };

  // Nouvelle fonction : création d'estimate SEULEMENT
  const createEstimateOnly = async () => {
    console.log('[Payment] createEstimateOnly called', { 
      service: state.service, 
      transaction: state.transaction, 
      billingProfile: state.billingProfile,
      existingEstimate: state.estimate?.estimateId 
    });
    
    if (!state.service) {
      console.warn('[Payment] Pré-requis manquants pour createEstimateOnly');
      return;
    }

    // Si un estimate réel existe déjà (pas un draft), le retourner
    if (state.estimate && !state.estimate.estimateId.startsWith('draft-') && !state.estimate.estimateNumber.startsWith('TEMP-')) {
      console.log('[Payment] Real estimate already exists:', state.estimate.estimateId);
      return { estimate: state.estimate };
    }

    // Vérifier dans sessionStorage pour éviter les doublons
    const estimateId = typeof window !== 'undefined' ? window.sessionStorage.getItem(`estimate-${sessionId}`) : null;
    if (estimateId) {
      console.log('[Payment] Found existing estimate in session:', estimateId);
      // Récupérer l'estimate depuis l'API
      try {
        const response = await fetch(`/api/payment/estimate/${estimateId}`);
        if (!response.ok) {
          console.error('[Payment] Failed to fetch existing estimate:', await response.text());
          throw new Error('Failed to fetch existing estimate');
        }
        const existingEstimate = await response.json();
        console.log('[Payment] Retrieved existing estimate:', existingEstimate);
        return { estimate: existingEstimate };
      } catch (error) {
        console.error('[Payment] Error fetching existing estimate:', error);
        // Si on ne peut pas récupérer l'estimate existante, on continue avec la création d'une nouvelle
      }
    }

    const estimateInput = {
      serviceId: state.service.id,
      proposalPrice: state.service.price,
      isDraft: false,
      details: {
        isDraft: false, // Marquer explicitement comme non-draft
        services: [{
          serviceID: state.service.serviceID,
          title: state.service.title,
          description: state.service.description || '',
          price: state.service.price,
          items: state.selectedAssets.map(asset => ({
            assetID: asset.assetID,
            title: asset.title,
            description: asset.description || '',
            quantity: asset.quantity || 1,
            price: asset.price
          }))
        }],
        items: state.selectedAssets.map(asset => ({
          assetID: asset.assetID,
          title: asset.title,
          description: asset.description || '',
          quantity: asset.quantity || 1,
          price: asset.price
        })),
        from: {
          name: state.service.providerName || "Service Provider",
          address: state.service.providerAddress || ""
        },
        to: {
          name: state.billingProfile?.name || "Customer",
          address: state.billingProfile?.address || ""
        },
        tax: state.service.legalVatPercent || 20,
        currency: 'EUR'
      }
    };
    
    console.log('[Payment] Creating estimate with input:', estimateInput);
    
    try {
      const estimateResponse = await fetch('/api/payment/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimateInput),
      });
      
      const estimateRaw = await estimateResponse.clone().text();
      console.log('[Payment] Raw estimate response:', estimateRaw);
      
      if (!estimateResponse.ok) {
        console.error('[Payment] Estimate creation failed:', estimateRaw);
        throw new Error('Failed to create estimate');
      }
      
      const estimate = JSON.parse(estimateRaw);
      console.log('[Payment] Estimate created:', estimate);
      
      // Sauvegarder l'ID de l'estimate dans sessionStorage
      if (typeof window !== 'undefined' && estimate.estimateId) {
        window.sessionStorage.setItem(`estimate-${sessionId}`, estimate.estimateId);
      }
      
      return { estimate };
    } catch (error) {
      console.error('[Payment] Error creating estimate:', error);
      throw error;
    }
  };

  // Met à jour l'estimate et l'order quand l'utilisateur modifie des quantités ou le profil de facturation
  const updateEstimateAndOrder = async () => {
    if (!state.estimate || !state.order) return;

    // Mettre à jour l'estimate
    const estimateResponse = await fetch('/api/payment/estimate', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estimateId: state.estimate.estimateNumber,
        billingProfile: state.billingProfile,
        items: state.estimate.items
      }),
    });

    if (!estimateResponse.ok) throw new Error('Failed to update estimate');

    // Mettre à jour l'order
    // const orderResponse = await fetch('/api/payment/order', {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     orderId: state.order.orderId,
    //     lines: state.order.lines
    //   }),
    // });

    // if (!orderResponse.ok) throw new Error('Failed to update order');
  };

  // Initie le paiement une fois que l'utilisateur a entré ses informations de carte
  const initiatePayment = async (input: CreatePaymentDto) => {
    if (!state.order) return null;

    const response = await fetch('/api/payment/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) throw new Error('Failed to initiate payment');
    return response.json();
  };

  // Finalise la transaction après un paiement réussi
  const finalizeTransactionFlow = async () => {
    if (!state.transaction) return;

    try {
      const response = await fetch('/api/payment/transaction', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: state.transaction.transactionId,
          status: 'COMPLETED'
        }),
      });

      if (!response.ok) throw new Error('Failed to finalize transaction');
      
      console.log('[Payment] Transaction finalized successfully');
      
      // Nettoyer sessionStorage après un paiement réussi
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('payment-session-id');
        window.sessionStorage.removeItem(`transaction-${sessionId}`);
        window.sessionStorage.removeItem(`estimate-${sessionId}`);
        console.log('[Payment] Session storage cleaned');
      }
      
      // Mettre à jour l'estimate et l'order si nécessaire
      if (state.estimate) {
        try {
          await updateEstimate({
            ...state.estimate,
            details: {
              ...state.estimate.details,
              status: 'PAID'
            }
          });
        } catch (error) {
          console.error('[Payment] Error updating estimate status:', error);
        }
      }
    } catch (error) {
      console.error('[Payment] Error finalizing transaction:', error);
      throw error;
    }
  };

  return {
    initiateTransactionFlow,
    createEstimateAndOrder,
    updateEstimateAndOrder,
    initiatePayment,
    finalizeTransactionFlow,
    updateEstimateFlow: async () => {
      if (!state.estimate) throw new Error('No estimate to update');
      const updatedEstimate = await updateEstimate(state.estimate);
      return updatedEstimate;
    },
    createOrderFromEstimateFlow: async () => {
      console.log('[Payment] State in createOrderFromEstimateFlow:', {
        estimate: state.estimate,
        estimateId: state.estimate?.estimateId,
        isDraft: state.estimate?.estimateId?.startsWith('draft-'),
        transaction: state.transaction,
        service: state.service?.id
      });

      // Vérifier si l'estimate existe dans le state
      if (!state.estimate) {
        // Si l'estimate n'est pas dans le state, vérifier dans sessionStorage
        const estimateId = typeof window !== 'undefined' ? window.sessionStorage.getItem(`estimate-${sessionId}`) : null;
        if (estimateId) {
          try {
            const response = await fetch(`/api/payment/estimate/${estimateId}`);
            if (!response.ok) {
              throw new Error('Failed to fetch estimate');
            }
            const estimate = await response.json();
            console.log('[Payment] Retrieved estimate from API:', estimate);
            if (estimate) {
              // Mettre à jour le state avec l'estimate récupéré
              dispatch({ type: "SET_ESTIMATE", payload: estimate });
              state.estimate = estimate;
            }
          } catch (error) {
            console.error('[Payment] Error fetching estimate:', error);
          }
        }
      }

      if (!state.estimate) throw new Error('No estimate to create order from');
      if (!state.transaction?.transactionId) throw new Error('No transaction ID available');
      if (!state.service?.id) throw new Error('No service ID available');
      if (!state.service?.organizationId) throw new Error('No seller organization ID available');

      // Vérifier que ce n'est pas un estimate draft
      if (state.estimate.estimateId.startsWith('draft-')) {
        console.error('Cannot create order from draft estimate:', state.estimate.estimateId);
        throw new Error('Cannot create order from draft estimate');
      }

      console.log('Creating order with estimate:', state.estimate.estimateId);
      console.log('Transaction ID:', state.transaction.transactionId);

      const response = await fetch('/api/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: state.estimate.estimateId,
          serviceId: state.service.id,
          transactionId: state.transaction.transactionId,
          sellerOrganizationId: state.service.organizationId,
          buyerOrganizationId: "0",
          totalPrice: state.estimate.details.total,
          currency: 'EUR',
          userId: user?.userID || "0",
          unloggedUser: "mail"
        })
      });
      if (!response.ok) throw new Error('Failed to create order');
      return response.json();
    },
    updateOrderLinesFlow: async () => {
      if (!state.order || !state.estimate) {
        console.warn('[Payment] No order or estimate to update');
        return;
      }

      console.log('[Payment] Updating order lines for order:', state.order.orderId);

      try {
        // Récupérer les lignes actuelles depuis l'estimate
        const newLines = (state.estimate.details.services as Array<any>).flatMap((service: any) =>
          (service.items as Array<any> || []).map((item: any) => ({
            assetId: item.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice || item.price,
            title: item.title,
            description: item.description,
            legalVatPercent: state.service?.legalVatPercent || 20
          }))
        );

        // Comparer avec les lignes existantes de l'order
        const existingLineAssetIds = state.order.lines.map(line => line.assetId);
        const newLineAssetIds = newLines.map(line => line.assetId);

        // Supprimer les lignes qui ne sont plus dans l'estimate
        const linesToDelete = state.order.lines.filter(line => !newLineAssetIds.includes(line.assetId));
        for (const line of linesToDelete) {
          await fetch('/api/payment/order', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: state.order.orderId,
              assetId: line.assetId
            })
          });
        }

        // Mettre à jour ou ajouter les lignes
        for (const newLine of newLines) {
          const existingLine = state.order.lines.find(line => line.assetId === newLine.assetId);
          
          if (existingLine) {
            // Mettre à jour si différent
            if (existingLine.quantity !== newLine.quantity || existingLine.unitPrice !== newLine.unitPrice) {
              const response = await fetch(`/api/payment/order/${state.order.orderId}/lines/${newLine.assetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  quantity: newLine.quantity,
                  unitPrice: newLine.unitPrice
                })
              });
              if (!response.ok) {
                console.error('Failed to update line:', newLine.assetId);
              }
            }
          } else {
            // Ajouter nouvelle ligne
            const response = await fetch('/api/payment/order', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: state.order.orderId,
                lineInput: {
                  orderAssetId: newLine.assetId,
                  assetId: newLine.assetId,
                  quantity: newLine.quantity,
                  unitPrice: newLine.unitPrice,
                  title: newLine.title,
                  description: newLine.description,
                  legalVatPercent: newLine.legalVatPercent,
                  details: {}
                }
              })
            });
            if (!response.ok) {
              console.error('Failed to add line:', newLine.assetId);
            }
          }
        }

        console.log('[Payment] Order lines updated successfully');
      } catch (error) {
        console.error('[Payment] Error updating order lines:', error);
        throw error;
      }
    },
    createEstimateOnly
  };
}; 