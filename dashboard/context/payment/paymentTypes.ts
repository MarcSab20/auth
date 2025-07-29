export interface PaymentState {
  service: Service | null;
  selectedAssets: AssetEntity[];
  estimate: EstimateDetails | null;
  order: Order | null;
  transaction: Transaction | null;
  billingProfile: BillingProfile | null;
  step: 'summary' | 'payment' | 'confirmation';
  currentStep?: number;
}

export interface PaymentActions {
  initiateTransactionFlow: () => Promise<Transaction>;
  createEstimateAndOrder: () => Promise<CreateEstimateAndOrderResult | undefined>;
  updateEstimateAndOrder: () => Promise<void>;
  initiatePayment: (input: CreatePaymentDto) => Promise<any>;
  finalizeTransactionFlow: () => Promise<void>;
  updateEstimateFlow: () => Promise<EstimateDetails>;
  createOrderFromEstimateFlow: () => Promise<Order>;
  updateOrderLinesFlow: () => Promise<void>;
  createEstimateOnly: () => Promise<{ estimate: EstimateDetails } | undefined>;
}

export interface PaymentContextType extends PaymentState {
  dispatch: React.Dispatch<PaymentAction>;
  actions: PaymentActions;
  nextStep: () => void;
  goToStep: (step: number) => void;
  addAsset: (asset: AssetEntity) => void;
  removeAsset: (assetId: string) => void;
  updateAssetQuantity: (assetId: string, quantity: number) => void;
  updateBillingProfile: (profile: BillingProfile) => void;
  setSelectedAssets: (assets: AssetEntity[]) => void;
  setService: (service: Service | null) => void;
  increaseQuantity: (assetId: string) => void;
  decreaseQuantity: (assetId: string) => void;
  createEstimateFlow: () => Promise<{ estimate: EstimateDetails } | undefined>;
  updateEstimateFlow: () => Promise<EstimateDetails>;
  createOrderFromEstimateFlow: () => Promise<Order>;
  updateOrderLinesFlow: () => Promise<void>;
  initiatePaymentFlow: (input: CreatePaymentDto) => Promise<any>;
  finalizePaymentFlow: () => Promise<void>;
  createEstimateOnly: () => Promise<{ estimate: EstimateDetails } | undefined>;
}

export type PaymentAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_SERVICE'; payload: Service | null }
  | { type: 'ADD_ASSET'; payload: AssetEntity }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'UPDATE_ASSET_QUANTITY'; payload: { assetId: string; quantity: number } }
  | { type: 'SET_ESTIMATE'; payload: EstimateDetails }
  | { type: 'SET_ORDER'; payload: Order }
  | { type: 'SET_TRANSACTION'; payload: Transaction }
  | { type: 'SET_BILLING_PROFILE'; payload: BillingProfile }
  | { type: 'SET_SELECTED_ASSETS'; payload: AssetEntity[] };

export interface Service {
  id: string;
  serviceID: string;
  title: string;
  description?: string;
  price: number;
  organizationId: string;
  legalVatPercent?: number;
  providerName?: string;
  providerAddress?: string;
  advancedAttributes?: string;
}

export interface Asset {
  assetID: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
}

export interface BillingProfile {
  name: string;
  address: string;
}

export interface Transaction {
  transactionId: string;
  serviceId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'INITIATED';
}


export interface Estimate {
  estimateId: string;
  serviceId: string;
  proposalPrice?: number;
  details: any;
  status: string;
  negotiationCount: number;
  clientSignDate?: string;
  providerSignDate?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  buyerUserId?: string;
  buyerOrganizationId?: string;
}
export interface EstimateDetails {
  estimateId: string;
  estimateNumber: string;
  details: {
    services: Array<{
      serviceID: string;
      title: string;
      description: string;
      price: number;
      items: Array<{
        id: string;
        title: string;
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
      actions: any[];
      isNegotiable: boolean;
      status: string;
    }>;
    from: {
      name: string;
      address: string;
    };
    to: {
      name: string;
      address: string;
    };
    estimateNumber: string;
    issueDate: string;
    validUntil: string;
    tax: number;
    subTotal: number;
    total: number;
    actions: any[];
    isNegotiable: boolean;
    status: string;
  };
  items: any[];
}

export interface Order {
  orderId: string;
  estimateId: string;
  transactionId: string;
  serviceId: string;
  sellerOrganizationId: string;
  totalPrice: number;
  currency: string;
  lines: {
    assetId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    description: string;
    legalVatPercent: number;
  }[];
}

export interface CreatePaymentDto {
  transactionId?: string;
  orderId: string;
  type: string;
  amount: number;
  currency: string;
}

export interface PaymentProviderProps {
  children: React.ReactNode;
}

export interface AssetEntity {
  assetID: string;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  legalVatPercent?: number;
}

export interface EstimateResponse {
  estimateId: string;
  proposalPrice?: number;
  sellerOrganizationId?: string;
  buyerOrganizationId?: string;
  lines?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  tax?: number;
  subTotal?: number;
  total?: number;
  validUntil?: string;
}

// Types pour le logging des actions
export type EstimateActionType = 
  | 'FIELD_UPDATED'
  | 'ITEM_ADDED'
  | 'ITEM_REMOVED'
  | 'ITEM_QUANTITY_CHANGED'
  | 'PRICE_PROPOSED'
  | 'COMMENT_ADDED'
  | 'ADDRESS_UPDATED'
  | 'BILLING_INFO_UPDATED';

export interface EstimateAction {
  id: string;
  type: EstimateActionType;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    type: 'USER' | 'ORGANIZATION';
  };
  details: {
    field?: string;
    oldValue?: any;
    newValue?: any;
    itemId?: string;
    comment?: string;
    proposedPrice?: number;
  };
}

export interface EstimateAddress {
  name: string;
  address: string;
  email?: string;
  phone?: string;
  isEditable?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface EstimateService {
  serviceID: string;
  title: string;
  description: string;
  price: number;
  items: EstimateItem[];
  actions: any[];
  isNegotiable: boolean;
  status: string;
}

export interface EstimateItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  total?: number;
}

export interface CreateEstimateAndOrderResult {
  estimate: EstimateDetails;
  order?: Order;
} 