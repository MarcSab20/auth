// smp-sdk-ts/src/estimate/estimate.ts

import { APIClient } from '../api/APIClient';
import { estimateQueries } from '../api/graphql/queries/accounting/estimateQueries';
import type { 
  Negotiation, 
  CreateNegotiationInput, 
  NegotiationResponse,
  NegotiationStatus 
} from '../types/Estimate';

interface EstimateResponse {
  estimateId: string;
  serviceId: string;
  proposalPrice?: number;
  details: any;
  status: string;
  negotiationCount: number;
  negotiationStatus?: NegotiationStatus;
  currentNegotiationId?: string;
  clientSignDate?: string;
  providerSignDate?: string;
  createdAt: string;
  updatedAt?: string;
  // deletedAt?: string;
  buyerUserId?: string;
  buyerOrganizationId?: string;
  sellerOrganizationId?: string;
}

interface CreateEstimateResponse {
  createEstimate: EstimateResponse;
}

interface UpdateEstimateResponse {
  updateEstimate: EstimateResponse;
}

interface ValidateEstimateResponse {
  validateEstimate: EstimateResponse;
}

interface GetEstimateResponse {
  estimate: EstimateResponse;
}

/**
 * The `Estimate` class manages estimate-related requests within the application.
 * Provides methods to retrieve, list, and search estimates.
 */
export class Estimate {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Creates a new estimate
   */
  async create(data: {
    serviceId: string;
    proposalPrice?: number;
    buyerUserId?: string;
    buyerOrganizationId?: string;
    negotiationCount?: number;
    details?: any;
  }): Promise<EstimateResponse> {
    const query = estimateQueries.CREATE_ESTIMATE;
    const response = await this.client.mutate<CreateEstimateResponse>(query, { data });
    return response.createEstimate;
  }

  /**
   * Updates an existing estimate
   */
  async update(id: string, data: {
    proposalPrice?: number;
    details?: any;
  }): Promise<EstimateResponse> {
    const query = estimateQueries.UPDATE_ESTIMATE;
    const response = await this.client.mutate<UpdateEstimateResponse>(query, { id, data });
    return response.updateEstimate;
  }

  /**
   * Validates an estimate
   */
  async validate(data: {
    estimateId: string;
    role: string;
    details?: any;
  }): Promise<EstimateResponse> {
    const query = estimateQueries.VALIDATE_ESTIMATE;
    const response = await this.client.mutate<ValidateEstimateResponse>(query, { data });
    return response.validateEstimate;
  }

  /**
   * Retrieves an estimate by its ID
   */
  async getById(estimateId: string): Promise<EstimateResponse> {
    const query = estimateQueries.GET_ESTIMATE_BY_ID;
    const response = await this.client.query<GetEstimateResponse>(query, { estimateId });
    return response.estimate;
  }

  /**
   * Retrieves a list of estimates with optional pagination, sorting, and filters.
   */
  async list(pagination?: any, sort?: any, filter?: any): Promise<any[]> {
    const query = estimateQueries.GET_ESTIMATES;
    const variables = { pagination, sort, filter };
    const response = await this.client.query(query, variables) as  { estimates: any[] };
    return response.estimates;
  }

  /**
   * Fetches multiple estimates by an array of estimate IDs.
   */
  async getByIDs(estimateIDs: string[]): Promise<any[]> {
    const query = estimateQueries.GET_ESTIMATES_BY_IDS;
    const variables = { estimateIDs };
    const response = await this.client.query(query, variables) as { data: { estimatesByIDs: any[] } };
    return response.data.estimatesByIDs;
  }

  /**
   * Fetches an estimate by its unique reference (`uniqRef`).
   */
  async getByUniqRef(uniqRef: string): Promise<any> {
    const query = estimateQueries.GET_ESTIMATE_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query(query, variables) as { data: { estimateByUniqRef: any } };
    return response.data.estimateByUniqRef;
  }

  /**
   * Fetches an estimate by its slug.
   */
  async getBySlug(slug: string): Promise<any> {
    const query = estimateQueries.GET_ESTIMATE_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query(query, variables) as { data: { estimateBySlug: any } };
    return response.data.estimateBySlug;
  }

  /**
   * Fetches multiple estimates by their slugs.
   */
  async getBySlugs(slugs: string[]): Promise<any[]> {
    const query = estimateQueries.GET_ESTIMATES_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query(query, variables) as { data: { estimatesBySlugs: any[] } };
    return response.data.estimatesBySlugs;
  }

  /**
   * Retrieves estimates by buyer user ID
   */
  async getByBuyerUserId(buyerUserId: string): Promise<EstimateResponse[]> {
    const query = estimateQueries.GET_ESTIMATES_BY_BUYER_USER_ID;
    const response = await this.client.query<{ estimatesByBuyerUserId: EstimateResponse[] }>(query, { buyerUserId });
    return response.estimatesByBuyerUserId;
  }

  /**
   * Retrieves estimates by buyer organization ID
   */
  async getByBuyerOrganizationId(buyerOrganizationId: string): Promise<EstimateResponse[]> {
    const query = estimateQueries.GET_ESTIMATES_BY_BUYER_ORGANIZATION_ID;
    const response = await this.client.query<{ estimatesByBuyerOrganizationId: EstimateResponse[] }>(query, { buyerOrganizationId });
    return response.estimatesByBuyerOrganizationId;
  }

  /**
   * Retrieves estimates by seller organization ID
   */
  async getBySellerOrganizationId(sellerOrganizationId: string): Promise<EstimateResponse[]> {
    const query = estimateQueries.GET_ESTIMATES_BY_SELLER_ORGANIZATION_ID;
    const response = await this.client.query<{ estimatesBySellerOrganizationId: EstimateResponse[] }>(query, { sellerOrganizationId });
    return response.estimatesBySellerOrganizationId;
  }

  // Negotiation methods

  /**
   * Creates a new negotiation for an estimate
   */
  async createNegotiation(input: CreateNegotiationInput): Promise<NegotiationResponse> {
    const query = estimateQueries.CREATE_NEGOTIATION;
    const response = await this.client.mutate<{ createNegotiation: NegotiationResponse }>(query, { input });
    return response.createNegotiation;
  }

  /**
   * Accepts the current negotiation for an estimate
   */
  async acceptNegotiation(estimateId: string): Promise<EstimateResponse> {
    const query = estimateQueries.ACCEPT_NEGOTIATION;
    const response = await this.client.mutate<{ acceptNegotiation: EstimateResponse }>(query, { estimateId });
    return response.acceptNegotiation;
  }

  /**
   * Rejects the current negotiation for an estimate
   */
  async rejectNegotiation(estimateId: string): Promise<EstimateResponse> {
    const query = estimateQueries.REJECT_NEGOTIATION;
    const response = await this.client.mutate<{ rejectNegotiation: EstimateResponse }>(query, { estimateId });
    return response.rejectNegotiation;
  }

  /**
   * Retrieves the negotiation history for an estimate
   */
  async getNegotiationHistory(estimateId: string): Promise<Negotiation[]> {
    const query = estimateQueries.GET_NEGOTIATION_HISTORY;
    const response = await this.client.query<{ getNegotiationHistory: Negotiation[] }>(query, { estimateId });
    return response.getNegotiationHistory;
  }

  /**
   * Retrieves the current active negotiation for an estimate
   */
  async getCurrentNegotiation(estimateId: string): Promise<Negotiation | null> {
    const query = estimateQueries.GET_CURRENT_NEGOTIATION;
    const response = await this.client.query<{ getCurrentNegotiation: Negotiation | null }>(query, { estimateId });
    return response.getCurrentNegotiation;
  }
}
