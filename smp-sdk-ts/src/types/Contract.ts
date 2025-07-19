export enum ContractStatus {
  PENDING = 'PENDING',
  PROVIDER_SIGNED = 'PROVIDER_SIGNED',
  CLIENT_SIGNED = 'CLIENT_SIGNED',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED'
}

export enum SignerRole {
  CLIENT = 'client',
  PROVIDER = 'provider'
}

export enum SignatureType {
  HASH = 'hash',
  IMAGE = 'image',
  UPLOAD = 'upload',
  DIGITAL = 'digital'
}

export interface ContractResponse {
  contractId: string;
  estimateId?: string;
  serviceId: string;
  organizationId?: string;
  clientSignHash?: string;
  providerSignHash?: string;
  status: ContractStatus;
  content: any;
  variables: any;
  details: any;

  clientSignDate?: string;
  providerSignDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContractInput {
  serviceId: string;
  estimateId?: string;
  organizationId?: string;
  status?: string;
  content: any;
  variables: any;
  details?: any;
  authorId?: string;
}

export interface UpdateContractInput {
  contractId: string;
  status?: string;
  content?: any;
  variables?: any;
  details?: any;
  organizationId?: string;
}

export interface SignContractInput {
  contractId: string;
  role: SignerRole;
  signatureType: SignatureType;
  signatureHash?: string;
  signatureImage?: string;
  signatureFileUrl?: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    timestamp?: string;
    location?: string;
  };
  signerEmail?: string;
}

export interface SendContractInput {
  contractId: string;
  email: string;
  message?: string;
  firstName?: string;
  lastName?: string;
  role?: 'client' | 'provider';
}

export interface CreateContractResponse {
  createContract: ContractResponse;
}

export interface UpdateContractResponse {
  updateContract: ContractResponse;
}

export interface SignContractResponse {
  signContract: ContractResponse;
}

export interface SendContractResponse {
  sendContract: {
    success: boolean;
    message: string;
  };
}

export interface GetContractResponse {
  contract: ContractResponse;
}

export interface GetContractsResponse {
  contracts: ContractResponse[];
} 