import { APIClient } from '../api/APIClient';
import { assetQueries } from '../api/graphql/queries/catalog/assetQueries';
import { assetMutations } from '../api/graphql/mutations/catalog/assetMutations';
import { assetMediaQueries } from '../api/graphql/queries/catalog/assetMediaQueries';
import { assetMediaMutations } from '../api/graphql/mutations/catalog/assetMediaMutations';

// --- Entity Interfaces ---
interface MediaEntity {
  mediaID: string;
  url: string;
  mediaType: string;
  originalName: string;
  finalName: string;
}

interface AssetMediaEntity {
  assetMediaID: string;
  assetID: string;
  mediaID: string;
  listingPosition: number;
  legend?: string;
  state: string;
  media: MediaEntity;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AssetEntity {
  assetID: string;
  uniqRef?: string;
  slug?: string;
  title: string;
  authorID?: string;
  organizationID?: string;
  mediaID?: string;
  description?: string;
  price: number;
  legalVatPercent?: number;
  quantity: number;
  stockQuantity?: number;
  maxPerReservation?: number;
  conflictingAssets?: JSON;
  applyableAssets?: JSON;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  medias: AssetMediaEntity[];
}

export interface ServiceAssetPayloadEntity {
  serviceAssetID: string;
  serviceID: string;
  assetID: string;
}

export interface AssetWithServiceAssetEntity {
  asset: AssetEntity;
  serviceAsset: ServiceAssetPayloadEntity;
}

export interface ServiceWithServiceAssetEntity {
  service: {
    serviceID: string;
    uniqRef?: string;
    slug?: string;
    authorID?: string;
    title: string;
    description?: string;
    mediaBannerID?: string;
    termsAndConditionsID?: string;
    parentServiceID?: string;
    topicID?: string;
    organizationID?: string;
    locationID?: string;
    paymentConfigID?: string;
    price: number;
    legalVatPercent?: number;
    lowerPrice?: number;
    upperPrice?: number;
    negotiable?: boolean;
    perimeter?: number;
    supplyType?: string;
    uptakeForm?: string;
    billingPlan?: string;
    onlineService?: boolean;
    advancedAttributes?: string;
    state: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
  };
  serviceAsset: {
    serviceAssetID: string;
    serviceID: string;
    assetID: string;
  };
}

export interface AssetWithLinksEntity {
  asset: AssetEntity;
  serviceLinks: ServiceWithServiceAssetEntity[];
}

export interface CreateAssetInput {
  title: string;
  stockQuantity?: number;
  organizationID?: string;
  mediaID?: string;
  description?: string;
  price: number;
  legalVatPercent?: number;
  quantity: number;
  maxPerReservation?: number;
  conflictingAssets?: JSON;
  applyableAssets?: JSON;
  state: string;
}

export interface UpdateAssetInput {
  title?: string;
  stockQuantity?: number;
  mediaID?: string;
  description?: string;
  price?: number;
  legalVatPercent?: number;
  quantity?: number;
  maxPerReservation?: number;
  conflictingAssets?: string;
  applyableAssets?: string;
  state?: string;
}

export interface ListAssetsByServiceInput {
  serviceID: string;
}

export interface ListServicesByAssetInput {
  assetID: string;
}

export interface ListAssetsByOrganizationInput {
  organizationID: string;
}

export interface MutationResponse {
  success: boolean;
  message: string;
}

export interface CreateAssetMediaInput {
  assetID: string;
  mediaID: string;
  listingPosition: number;
  legend?: string;
  state: string;
}

export interface UpdateAssetMediaInput {
  legend?: string;
  listingPosition?: number;
  state?: string;
}

/**
 * AssetController gère les requêtes relatives aux assets dans l'application.
 */
export class Asset {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  // ------------------------ QUERIES ------------------------

  async get(assetID: string): Promise<AssetEntity> {
    const query = assetQueries.GET_ASSET;
    const variables = { assetID };
    const response = await this.client.query<{ asset: AssetEntity }>(query, variables);
    return response.asset;
  }

  async list(
    pagination?: any,
    sort?: any,
    filter?: any
  ): Promise<AssetEntity[]> {
    const query = assetQueries.GET_ASSETS;
    const variables = { pagination, sort, filter };
    const response = await this.client.query<{ assets: AssetEntity[] }>(query, variables);
    return response.assets;
  }

  async assetBySlug(slug: string): Promise<AssetEntity> {
    const query = assetQueries.GET_ASSET_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query<{ assetBySlug: AssetEntity }>(query, variables);
    return response.assetBySlug;
  }

  async assetsByIDs(assetIDs: string[]): Promise<AssetEntity[]> {
    const query = assetQueries.GET_ASSETS_BY_IDS;
    const variables = { assetIDs };
    const response = await this.client.query<{ assetsByIDs: AssetEntity[] }>(query, variables);
    return response.assetsByIDs;
  }

  async assetsBySlugs(slugs: string[]): Promise<AssetEntity[]> {
    const query = assetQueries.GET_ASSETS_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query<{ assetsBySlugs: AssetEntity[] }>(query, variables);
    return response.assetsBySlugs;
  }

  async assetByUniqRef(uniqRef: string): Promise<AssetEntity> {
    const query = assetQueries.GET_ASSET_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query<{ assetByUniqRef: AssetEntity }>(query, variables);
    return response.assetByUniqRef;
  }

  /**
   * Récupère la liste des Assets associés à un service, avec pivot.
   */
  async listByService(
    input: ListAssetsByServiceInput
  ): Promise<AssetWithServiceAssetEntity[]> {
    const query = assetQueries.LIST_ASSETS_BY_SERVICE;
    const variables = { input };
    const response = await this.client.query<{
      listAssetsByService: AssetWithServiceAssetEntity[];
    }>(query, variables);
    return response.listAssetsByService;
  }

  /**
   * Récupère la liste des Services associés à un asset, avec pivot.
   */
  async listServicesByAsset(
    input: ListServicesByAssetInput
  ): Promise<ServiceWithServiceAssetEntity[]> {
    const query = assetQueries.LIST_SERVICES_BY_ASSET;
    const variables = { input };
    const response = await this.client.query<{
      listServicesByAsset: ServiceWithServiceAssetEntity[];
    }>(query, variables);
    return response.listServicesByAsset;
  }

  /**
   * Récupère la liste des Assets d'une organisation, avec tous leurs pivots.
   */
  async listByOrganization(
    input: ListAssetsByOrganizationInput
  ): Promise<AssetWithLinksEntity[]> {
    const query = assetQueries.LIST_ASSETS_BY_ORGANIZATION;
    const variables = { input };
    const response = await this.client.query<{
      listAssetsByOrganization: AssetWithLinksEntity[];
    }>(query, variables);
    return response.listAssetsByOrganization;
  }

  // ------------------------ MUTATIONS ------------------------

  async createAsset(
    input: CreateAssetInput
  ): Promise<AssetEntity> {
    const mutation = assetMutations.CREATE_ASSET;
    const variables = { input };
    const response = await this.client.mutate<{
      createAsset: AssetEntity;
    }>(mutation, variables);
    return response.createAsset;
  }

  async updateAsset(
    assetID: string,
    input: UpdateAssetInput
  ): Promise<AssetEntity> {
    const mutation = assetMutations.UPDATE_ASSET;
    const variables = { assetID, input };
    const response = await this.client.mutate<{
      updateAsset: AssetEntity;
    }>(mutation, variables);
    return response.updateAsset;
  }

  async deleteAsset(assetID: string): Promise<MutationResponse> {
    const mutation = assetMutations.DELETE_ASSET;
    const variables = { assetID };
    const response = await this.client.mutate<{
      deleteAsset: MutationResponse;
    }>(mutation, variables);
    return response.deleteAsset;
  }

  // ------------------------ ASSET MEDIA QUERIES ------------------------

  async getAssetMedia(assetMediaID: string): Promise<AssetMediaEntity> {
    const query = assetMediaQueries.GET_ASSET_MEDIA;
    const variables = { assetMediaID };
    const response = await this.client.query<{ assetMedia: AssetMediaEntity }>(query, variables);
    return response.assetMedia;
  }

  async listAssetMedias(
    pagination?: any,
    sort?: any,
    filter?: any
  ): Promise<AssetMediaEntity[]> {
    const query = assetMediaQueries.GET_ASSET_MEDIAS;
    const variables = { pagination, sort, filter };
    const response = await this.client.query<{ assetMedias: AssetMediaEntity[] }>(query, variables);
    return response.assetMedias;
  }

  async assetMediasByIDs(assetMediaIDs: string[]): Promise<AssetMediaEntity[]> {
    const query = assetMediaQueries.GET_ASSET_MEDIAS_BY_IDS;
    const variables = { assetMediaIDs };
    const response = await this.client.query<{ assetMediasByIDs: AssetMediaEntity[] }>(query, variables);
    return response.assetMediasByIDs;
  }

  // ------------------------ ASSET MEDIA MUTATIONS ------------------------

  async createAssetMedia(input: CreateAssetMediaInput): Promise<AssetMediaEntity> {
    const mutation = assetMediaMutations.CREATE_ASSET_MEDIA;
    const response = await this.client.mutate(mutation, { input }) as { createAssetMedia: AssetMediaEntity };
    return response.createAssetMedia;
  }

  async updateAssetMedia(assetMediaID: string, input: UpdateAssetMediaInput): Promise<AssetMediaEntity> {
    const mutation = assetMediaMutations.UPDATE_ASSET_MEDIA;
    const response = await this.client.mutate(mutation, { assetMediaID, input }) as { updateAssetMedia: AssetMediaEntity };
    return response.updateAssetMedia;
  }

  async deleteAssetMedia(assetMediaID: string): Promise<MutationResponse> {
    const mutation = assetMediaMutations.DELETE_ASSET_MEDIA;
    const response = await this.client.mutate(mutation, { assetMediaID }) as { deleteAssetMedia: MutationResponse };
    return response.deleteAssetMedia;
  }
}
