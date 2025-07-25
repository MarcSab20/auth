import { APIClient } from '../api/APIClient';
import { organizationQueries } from '../api/graphql/queries/organization/organizationQueries';
import { organizationMutations } from '../api/graphql/mutations/organization/organizationMutation';
import { organizationMediaQueries } from '../api/graphql/queries/organization/organizationMediaQueries';
import { organizationMediaMutations } from '../api/graphql/mutations/organization/organizationMediaMutations';

// Types des réponses
export interface Organization {
  organizationID: string;
  uniqRef: string;
  slug: string;
  authorID: number;
  ownerID?: number;
  orgRef?: string;
  sectorID?: number;
  legalName: string;
  brand?: string;
  sigle?: string;
  smallLogo?: string;
  bigLogo?: string;
  banner?: string;
  smallLogoUrl?: string;
  bigLogoUrl?: string;
  bannerUrl?: string;
  oSize?: string;
  juridicForm?: string;
  juridicCatLabel?: string;
  juridicCatCode?: string;
  currency?: string;
  legalUniqIdentifier?: string;
  vatNumber?: string;
  communityVATNumber?: string;
  capital?: number;
  insuranceRef?: string;
  insuranceName?: string;
  activityStartedAt?: number;
  activityEndedAt?: number;
  description: string;
  summary?: string;
  locationID?: string;
  parentOrganizationID?: string;
  advancedAttributes?: string; // JSON stringifié
  state: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  deletedAt?: string; // ISO 8601 format
}

export interface UserRoleInOrganization {
  roleID: string;
  roleName: string;
}

export interface OrganizationByUser {
  organizationID: string;
  organizationName: string;
  smallLogoUrl: string | null;
  userRole: UserRoleInOrganization;
}

// Types des inputs pour les mutations
export interface CreateOrganizationInput {
  authorID: number;
  ownerID?: number;
  orgRef?: string;
  sectorID?: number;
  legalName: string;
  brand?: string;
  sigle?: string;
  smallLogo?: string;
  bigLogo?: string;
  banner?: string;
  oSize?: string;
  juridicForm?: string;
  juridicCatLabel?: string;
  juridicCatCode?: string;
  currency?: string;
  legalUniqIdentifier?: string;
  vatNumber?: string;
  communityVATNumber?: string;
  capital?: number;
  insuranceRef?: string;
  insuranceName?: string;
  activityStartedAt?: number;
  activityEndedAt?: number;
  description: string;
  summary?: string;
  locationID?: string;
  parentOrganizationID?: string;
  advancedAttributes?: string; // JSON stringifié
  state: string;
}

export interface UpdateOrganizationInput {
  ownerID?: number;
  orgRef?: string;
  sectorID?: number;
  legalName?: string;
  brand?: string;
  sigle?: string;
  smallLogo?: string;
  bigLogo?: string;
  banner?: string;
  oSize?: string;
  juridicForm?: string;
  juridicCatLabel?: string;
  juridicCatCode?: string;
  currency?: string;
  legalUniqIdentifier?: string;
  vatNumber?: string;
  communityVATNumber?: string;
  capital?: number;
  insuranceRef?: string;
  insuranceName?: string;
  activityStartedAt?: number;
  activityEndedAt?: number;
  description?: string;
  summary?: string;
  locationID?: string;
  parentOrganizationID?: string;
  advancedAttributes?: string; // JSON stringifié
  state?: string;
}

export interface OrganizationMedia {
  organizationMediaID: string;
  mediaID: string;
  legend?: string;
  listingPosition?: number;
  state: string;
  media?: {
    mediaID: string;
    url: string;
    originalName: string;
    finalName: string;
  };
}

export interface CreateOrganizationMediaInput {
  mediaID: string;
  organizationID: string;
  legend?: string;
  listingPosition?: number;
  state?: string;
}

export interface UpdateOrganizationMediaInput {
  legend?: string;
  listingPosition?: number;
  state?: string;
}

/**
 * The `Organization` class manages organization-related requests within the application.
 */
export class Organization {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  //========================== QUERIES =============================================================

  /**
   * Fetches a list of organizations with optional pagination, sorting, and filters.
   */
  async list(pagination?: any, sort?: any, filter?: any): Promise<Organization[]> {
    const query = organizationQueries.GET_ORGANIZATIONS;
    const variables = { pagination, sort, filter };
    const response = await this.client.query(query, variables) as { organizations: Organization[]  };
    return response.organizations;
  }

  /**
   * Fetches a single organization by its ID.
   */
  async getById(organizationID: string): Promise<Organization> {
    const query = organizationQueries.GET_ORGANIZATION_BY_ID;
    const variables = { organizationID };
    const response = await this.client.query(query, variables) as { organization: Organization  };
    return response.organization;
  }

  /**
   * Fetches multiple organizations by their IDs.
   */
  async getByIDs(organizationIDs: string[]): Promise<Organization[]> {
    const query = organizationQueries.GET_ORGANIZATIONS_BY_IDS;
    const variables = { organizationIDs };
    const response = await this.client.query(query, variables) as { data: { organizationsByIDs: Organization[] } };
    return response.data.organizationsByIDs;
  }

  /**
   * Fetches a single organization by its unique reference.
   */
  async getByUniqRef(uniqRef: string): Promise<Organization> {
    const query = organizationQueries.GET_ORGANIZATION_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query(query, variables) as { data: { organizationByUniqRef: Organization } };
    return response.data.organizationByUniqRef;
  }

  /**
   * Fetches a single organization by its slug.
   */
  async getBySlug(slug: string): Promise<Organization> {
    const query = organizationQueries.GET_ORGANIZATION_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query(query, variables) as { data: { organizationBySlug: Organization } };
    return response.data.organizationBySlug;
  }

  /**
   * Fetches multiple organizations by their slugs.
   */
  async getBySlugs(slugs: string[]): Promise<Organization[]> {
    const query = organizationQueries.GET_ORGANIZATIONS_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query(query, variables) as { data: { organizationsBySlugs: Organization[] } };
    return response.data.organizationsBySlugs;
  }

  //========================== MUTATIONS =============================================================

  /**
   * Creates a new organization with the specified input.
   */
  async createOrganization(input: CreateOrganizationInput): Promise<Organization> {
    const mutation = organizationMutations.CREATE_ORGANIZATION;
    const variables = { input };
    const response = await this.client.mutate(mutation, variables) as { createOrganization: Organization };
    return response.createOrganization;
  }

  /**
   * Updates an existing organization by its ID with the specified input.
   */
  async updateOrganization(organizationID: string, input: UpdateOrganizationInput): Promise<Organization> {
    const mutation = organizationMutations.UPDATE_ORGANIZATION;
    const variables = { organizationID, input };
    const response = await this.client.mutate(mutation, variables) as { updateOrganization: Organization };
    return response.updateOrganization;
  }

  /**
   * Deletes an organization by its ID.
   */
  async deleteOrganization(organizationID: string): Promise<boolean> {
    const mutation = organizationMutations.DELETE_ORGANIZATION;
    const variables = { organizationID };
    const response = await this.client.mutate(mutation, variables) as { deleteOrganization: boolean };
    return response.deleteOrganization;
  }

  //========================== MEDIA QUERIES =============================================================

  /**
   * Fetches a single organization media by its ID.
   */
  async getOrganizationMedia(organizationMediaID: string): Promise<OrganizationMedia> {
    const query = organizationMediaQueries.GET_ORGANIZATION_MEDIA;
    const variables = { organizationMediaID };
    const response = await this.client.query(query, variables) as { organizationMedia: OrganizationMedia };
    return response.organizationMedia;
  }

  /**
   * Fetches all media for an organization.
   */
  async getOrganizationMedias(organizationID: string): Promise<OrganizationMedia[]> {
    const query = organizationMediaQueries.GET_ORGANIZATION_MEDIAS;
    const variables = { organizationID };
    const response = await this.client.query(query, variables) as { organizationMedias: OrganizationMedia[] };
    return response.organizationMedias;
  }

  //========================== MEDIA MUTATIONS =============================================================

  /**
   * Creates a new organization media.
   */
  async createOrganizationMedia(input: CreateOrganizationMediaInput): Promise<OrganizationMedia> {
    const mutation = organizationMediaMutations.CREATE_ORGANIZATION_MEDIA;
    const variables = { input };
    const response = await this.client.mutate(mutation, variables) as { createOrganizationMedia: OrganizationMedia };
    return response.createOrganizationMedia;
  }

  /**
   * Updates an existing organization media.
   */
  async updateOrganizationMedia(organizationMediaID: string, input: UpdateOrganizationMediaInput): Promise<OrganizationMedia> {
    const mutation = organizationMediaMutations.UPDATE_ORGANIZATION_MEDIA;
    const variables = { organizationMediaID, input };
    const response = await this.client.mutate(mutation, variables) as { updateOrganizationMedia: OrganizationMedia };
    return response.updateOrganizationMedia;
  }

  /**
   * Deletes an organization media.
   */
  async deleteOrganizationMedia(organizationMediaID: string): Promise<boolean> {
    const mutation = organizationMediaMutations.DELETE_ORGANIZATION_MEDIA;
    const variables = { organizationMediaID };
    const response = await this.client.mutate(mutation, variables) as { deleteOrganizationMedia: { success: boolean } };
    return response.deleteOrganizationMedia.success;
  }
}
