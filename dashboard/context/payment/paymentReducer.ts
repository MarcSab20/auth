import { PaymentState, PaymentAction } from './paymentTypes';

export const paymentReducer = (state: PaymentState, action: PaymentAction): PaymentState => {
  switch (action.type) {
    case 'SET_SERVICE':
      return {
        ...state,
        service: action.payload
      };
    case 'SET_TRANSACTION':
      return {
        ...state,
        transaction: action.payload
      };
    case 'SET_ESTIMATE':
      return {
        ...state,
        estimate: action.payload
      };
    case 'SET_ORDER':
      return {
        ...state,
        order: action.payload
      };
    case 'SET_SELECTED_ASSETS':
      return {
        ...state,
        selectedAssets: action.payload
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
    case 'SET_BILLING_PROFILE':
      return {
        ...state,
        billingProfile: action.payload
      };
    default:
      return state;
  }
}; 