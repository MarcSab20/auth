export enum NegotiationStatus {
  NONE = 'NONE',
  IN_PROGRESS = 'IN_PROGRESS',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface Negotiation {
  id: string;
  estimateId: string;
  proposedPrice: number;
  details?: Record<string, any>;
  iterationCount: number;
  status: NegotiationStatus;
  proposedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateDetails {
  estimateId: string;
  estimateNumber: string;
  buyerUserId?: string;
  buyerOrganizationId?: string;
  sellerOrganizationId: string;
  proposalPrice?: number;
  currentNegotiationId?: string;
  negotiationStatus: NegotiationStatus;
  details: {
    services: Array<{
      serviceID: string;
      title: string;
      description: string;
      synthese: string;
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

export interface CreateNegotiationInput {
  estimateId: string;
  proposedPrice: number;
  proposedBy: string;
  details?: Record<string, any>;
}

export interface NegotiationResponse {
  estimate: EstimateDetails;
  negotiation: Negotiation;
} 