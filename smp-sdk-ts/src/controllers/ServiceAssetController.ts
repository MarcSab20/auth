import { APIClient } from '../api/APIClient';
import { serviceAssetQueries } from '../api/graphql/queries/catalog/serviceAssetQueries';
import { serviceAssetMutations } from '../api/graphql/mutations/catalog/serviceAssetMutations';

/**
 * Représente une entité ServiceAsset telle que définie dans le schéma GraphQL.
 */
export interface ServiceAssetEntity {
  serviceAssetID: string;
  uniqRef?: string;
  slug: string;
  assetID: string;
  serviceID: string;
  legend?: string;
  state: string; // ObjectStatus représenté ici comme string
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
  deletedAt?: string; // ISO8601
}

/**
 * Input pour la création d'un ServiceAsset.
 */
export interface CreateServiceAssetInput {
  assetID: string;
  serviceID: string;
  legend?: string;
  state: string;
}

/**
 * Input pour la mise à jour d'un ServiceAsset.
 */
export interface UpdateServiceAssetInput {
  assetID?: string;
  serviceID?: string;
  legend?: string;
  state?: string;
}

/**
 * Type de réponse pour les mutations (ex : suppression).
 */
export interface MutationResponse {
  success: boolean;
  message: string;
}

/**
 * ServiceAssetController gère les requêtes relatives aux ServiceAssets dans l'application.
 */
export class ServiceAsset {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  // ------------------------ QUERIES ------------------------

  /**
   * Récupère un ServiceAsset par son ID.
   * @param serviceAssetID - L'identifiant du ServiceAsset.
   */
  async get(serviceAssetID: string): Promise<ServiceAssetEntity> {
    const query = serviceAssetQueries.GET_SERVICE_ASSET;
    const variables = { serviceAssetID };
    const response = await this.client.query(query, variables) as { data: { serviceAsset: ServiceAssetEntity } };
    return response.data.serviceAsset;
  }

  /**
   * Récupère la liste de tous les ServiceAssets avec pagination, tri et filtres optionnels.
   */
  async list(pagination?: any, sort?: any, filter?: any): Promise<ServiceAssetEntity[]> {
    const query = serviceAssetQueries.GET_SERVICE_ASSETS;
    const variables = { pagination, sort, filter };
    const response = await this.client.query(query, variables) as { data: { serviceAssets: ServiceAssetEntity[] } };
    return response.data.serviceAssets;
  }

  /**
   * Récupère un ServiceAsset par son slug.
   * @param slug - Le slug du ServiceAsset.
   */
  async getBySlug(slug: string): Promise<ServiceAssetEntity> {
    const query = serviceAssetQueries.GET_SERVICE_ASSET_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query(query, variables) as { data: { serviceAssetBySlug: ServiceAssetEntity } };
    return response.data.serviceAssetBySlug;
  }

  /**
   * Récupère plusieurs ServiceAssets par leurs IDs.
   * @param serviceAssetIDs - Tableau d'IDs de ServiceAssets.
   */
  async getByIDs(serviceAssetIDs: string[]): Promise<ServiceAssetEntity[]> {
    const query = serviceAssetQueries.GET_SERVICE_ASSETS_BY_IDS;
    const variables = { serviceAssetIDs };
    const response = await this.client.query(query, variables) as { data: { serviceAssetsByIDs: ServiceAssetEntity[] } };
    return response.data.serviceAssetsByIDs;
  }

  /**
   * Récupère plusieurs ServiceAssets par leurs slugs.
   * @param slugs - Tableau de slugs de ServiceAssets.
   */
  async getBySlugs(slugs: string[]): Promise<ServiceAssetEntity[]> {
    const query = serviceAssetQueries.GET_SERVICE_ASSETS_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query(query, variables) as { data: { serviceAssetsBySlugs: ServiceAssetEntity[] } };
    return response.data.serviceAssetsBySlugs;
  }

  /**
   * Récupère un ServiceAsset par sa référence unique.
   * @param uniqRef - La référence unique du ServiceAsset.
   */
  async getByUniqRef(uniqRef: string): Promise<ServiceAssetEntity> {
    const query = serviceAssetQueries.GET_SERVICE_ASSET_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query(query, variables) as { data: { serviceAssetByUniqRef: ServiceAssetEntity } };
    return response.data.serviceAssetByUniqRef;
  }

  // ------------------------ MUTATIONS ------------------------

  /**
   * Crée un nouveau ServiceAsset.
   * @param input - Les données pour créer le ServiceAsset.
   */
  async createServiceAsset(input: CreateServiceAssetInput): Promise<ServiceAssetEntity> {
    const mutation = serviceAssetMutations.CREATE_SERVICE_ASSET;
    const variables = { input };
    const response = await this.client.mutate(mutation, variables) as { data: { createServiceAsset: ServiceAssetEntity } };
    return response.data.createServiceAsset;
  }

  /**
   * Met à jour un ServiceAsset existant.
   * @param serviceAssetID - L'identifiant du ServiceAsset à mettre à jour.
   * @param input - Les données de mise à jour.
   */
  async updateServiceAsset(serviceAssetID: string, input: UpdateServiceAssetInput): Promise<ServiceAssetEntity> {
    const mutation = serviceAssetMutations.UPDATE_SERVICE_ASSET;
    const variables = { serviceAssetID, input };
    const response = await this.client.mutate(mutation, variables) as { data: { updateServiceAsset: ServiceAssetEntity } };
    return response.data.updateServiceAsset;
  }

  /**
   * Supprime un ServiceAsset.
   * @param serviceAssetID - L'identifiant du ServiceAsset à supprimer.
   */
  async deleteServiceAsset(serviceAssetID: string): Promise<MutationResponse> {
    const mutation = serviceAssetMutations.DELETE_SERVICE_ASSET;
    const variables = { serviceAssetID };
    const response = await this.client.mutate(mutation, variables) as { data: { deleteServiceAsset: MutationResponse } };
    return response.data.deleteServiceAsset;
  }
}
