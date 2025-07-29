"use client";

import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef } from 'react';
import { 
  PaymentContextType, 
  PaymentState, 
  PaymentProviderProps, 
  AssetEntity, 
  Service, 
  PaymentActions, 
  Transaction, 
  Order, 
  EstimateDetails,
  CreatePaymentDto 
} from './paymentTypes';
import { createPaymentActions } from './paymentActions';
import { useAuth } from '@/context/authenticationContext';

const initialState: PaymentState = {
  service: null,
  selectedAssets: [],
  estimate: null,
  order: null,
  transaction: null,
  billingProfile: null,
  step: 'summary',
  currentStep: 1
};

type PaymentAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_SERVICE'; payload: PaymentState['service'] }
  | { type: 'ADD_ASSET'; payload: PaymentState['selectedAssets'][0] }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'UPDATE_ASSET_QUANTITY'; payload: { assetId: string; quantity: number } }
  | { type: 'SET_ESTIMATE'; payload: PaymentState['estimate'] }
  | { type: 'SET_ORDER'; payload: PaymentState['order'] }
  | { type: 'SET_TRANSACTION'; payload: PaymentState['transaction'] }
  | { type: 'SET_INVOICE_ID'; payload: string }
  | { type: 'SET_BILLING_PROFILE'; payload: PaymentState['billingProfile'] }
  | { type: 'SET_SELECTED_ASSETS'; payload: AssetEntity[] };

function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_SERVICE':
      if (!action.payload || (state.service && state.service.id !== action.payload.id)) {
        return {
          ...initialState,
          service: action.payload,
          step: 'summary',
          currentStep: 1
        };
      }
      return { ...state, service: action.payload };
    case 'ADD_ASSET':
      return {
        ...state,
        selectedAssets: [...state.selectedAssets, action.payload]
      };
    case 'REMOVE_ASSET':
      return {
        ...state,
        selectedAssets: state.selectedAssets.filter(asset => asset.assetID !== action.payload)
      };
    case 'UPDATE_ASSET_QUANTITY':
      return {
        ...state,
        selectedAssets: state.selectedAssets.map(asset =>
          asset.assetID === action.payload.assetId
            ? { ...asset, quantity: action.payload.quantity }
            : asset
        )
      };
    case 'SET_ESTIMATE':
      return { ...state, estimate: action.payload };
    case 'SET_ORDER':
      return { ...state, order: action.payload };
    case 'SET_TRANSACTION':
      return { ...state, transaction: action.payload };
    case 'SET_BILLING_PROFILE':
      return { ...state, billingProfile: action.payload };
    case 'SET_SELECTED_ASSETS':
      return { ...state, selectedAssets: action.payload };
    default:
      return state;
  }
}

const PaymentContext = createContext<PaymentContextType | null>(null);

// Fonctions utilitaires
const createEstimate = async (): Promise<EstimateDetails> => {
  // Implémentation
  return {} as EstimateDetails;
};

const updateEstimate = async (estimate: EstimateDetails): Promise<EstimateDetails> => {
  // Implémentation
  return estimate;
};

const createOrder = async (estimate: EstimateDetails): Promise<Order> => {
  // Implémentation
  return {} as Order;
};

const isBillingComplete = (billingProfile: any) =>
  typeof billingProfile?.name === 'string' &&
  billingProfile.name.trim().length > 0 &&
  typeof billingProfile?.address === 'string' &&
  billingProfile.address.trim().length > 0;

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);
  const { user } = useAuth();
  // Ref pour le pending
  const isTransactionPendingRef = useRef(false);
  // Mémoïser les actions uniquement sur les clés métier
  const actions = useMemo(
    () => createPaymentActions(state, user, isTransactionPendingRef, dispatch),
    [state.service?.id, state.transaction?.transactionId, user?.userID]
  );
  // Mémoïser la valeur de contexte
  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      actions,
      nextStep: async () => {
        dispatch({ type: 'SET_CURRENT_STEP', payload: (state.currentStep || 1) + 1 });
      },
      goToStep: (step: number) => dispatch({ type: 'SET_CURRENT_STEP', payload: step }),
      addAsset: (asset: AssetEntity) => dispatch({ type: 'ADD_ASSET', payload: { ...asset, quantity: 1 } }),
      removeAsset: (assetId: string) => dispatch({ type: 'REMOVE_ASSET', payload: assetId }),
      updateAssetQuantity: (assetId: string, quantity: number) => dispatch({ type: 'UPDATE_ASSET_QUANTITY', payload: { assetId, quantity } }),
      updateBillingProfile: (profile: any) => dispatch({ type: 'SET_BILLING_PROFILE', payload: profile }),
      setSelectedAssets: (assets: AssetEntity[]) => dispatch({ type: 'SET_SELECTED_ASSETS', payload: assets }),
      setService: (service: Service | null) => dispatch({ type: 'SET_SERVICE', payload: service }),
      increaseQuantity: (assetId: string) => {
        const asset = state.selectedAssets.find(a => a.assetID === assetId);
        if (asset) {
          dispatch({ type: 'UPDATE_ASSET_QUANTITY', payload: { assetId, quantity: (asset.quantity || 1) + 1 } });
        }
      },
      decreaseQuantity: (assetId: string) => {
        const asset = state.selectedAssets.find(a => a.assetID === assetId);
        if (asset && (asset.quantity || 1) > 1) {
          dispatch({ type: 'UPDATE_ASSET_QUANTITY', payload: { assetId, quantity: (asset.quantity || 1) - 1 } });
        }
      },
      createEstimateFlow: actions.createEstimateOnly,
      updateEstimateFlow: actions.updateEstimateFlow,
      createOrderFromEstimateFlow: actions.createOrderFromEstimateFlow,
      updateOrderLinesFlow: actions.updateOrderLinesFlow,
      initiatePaymentFlow: actions.initiatePayment,
      finalizePaymentFlow: actions.finalizeTransactionFlow,
      createEstimateOnly: actions.createEstimateOnly
    }),
    [state, dispatch, actions]
  );
  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const createEstimateAndOrder = async () => {
  console.log('createEstimateAndOrder called');
  // ...
} 