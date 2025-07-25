import { APIClient } from '../api/APIClient';
import { mediaMutations } from '../api/graphql/mutations/document/mediaMutation';
import { mediaQueries } from '../api/graphql/queries/document/mediaQueries';

// Types d'entrée pour les mutations des médias
interface CreateMediaInput {
  mediaType?: string;
  authorID?: string;
  legend?: string;
  summary?: string;
  originalName?: string;
  finalName?: string;
  entityID?: string;
  metadata?: any;
  entityName?: string;
  url?: string;
  size?: string;
  state?: string;
}

interface UpdateMediaInput {
  legend?: string;
  summary?: string;
  originalName?: string;
  finalName?: string;
  metadata?: any;
  url?: string;
  size?: string;
  state?: string;
}

// Types de réponse pour les mutations et les requêtes
interface MediaEntity {
  mediaID: string;
  uniqRef: string;
  slug: string;
  authorID: string;
  mediaType: string;
  legend: string;
  summary: string;
  originalName: string;
  finalName: string;
  url: string;
  size: string;
  entityID: string;
  metadata: any;
  entityName: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
} 

interface MutationResponse {
  success: boolean;
  message: string;
}

/**
 * The `Media` class manages media-related requests within the application.
 * Provides methods to create, update, delete, and retrieve media files.
 */
export class Media {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  // ======================= MUTATIONS =======================

  async createMedia(input: CreateMediaInput): Promise<MediaEntity> {
    const mutation = mediaMutations.CREATE_MEDIA;
    const variables = { input };
    const response = await this.client.mutate(mutation, variables) as { createMedia: MediaEntity };
    return response.createMedia;
  }

  async updateMedia(mediaID: string, input: UpdateMediaInput): Promise<MediaEntity> {
    const mutation = mediaMutations.UPDATE_MEDIA;
    const variables = { mediaID, input };
    const response = await this.client.mutate(mutation, variables) as { updateMedia: MediaEntity };
    return response.updateMedia;
  }

  async deleteMedia(mediaID: string): Promise<MutationResponse> {
    const mutation = mediaMutations.DELETE_MEDIA;
    const variables = { mediaID };
    const response = await this.client.mutate(mutation, variables) as { deleteMedia: MutationResponse };
    return response.deleteMedia;
  }

  // ======================= QUERIES =======================

  async getMedia(mediaID: string): Promise<MediaEntity> {
    const query = mediaQueries.GET_MEDIA;
    const variables = { mediaID };
    const response = await this.client.query(query, variables) as { media: MediaEntity };
    return response.media;
  }

  async list(pagination?: any, sort?: any, filter?: any[]): Promise<MediaEntity[]> {
    const query = mediaQueries.GET_MEDIAS;
    const variables = { pagination, sort, filter };
    const response = await this.client.query(query, variables) as { medias: MediaEntity[] };
    return response.medias;
  }

  async getMediaBySlug(slug: string): Promise<MediaEntity> {
    const query = mediaQueries.GET_MEDIA_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query(query, variables) as { mediaBySlug: MediaEntity };
    return response.mediaBySlug;
  }

  async getMediasByIds(mediaIDs: string[]): Promise<MediaEntity[]> {
    const query = mediaQueries.GET_MEDIAS_BY_IDS;
    const variables = { mediaIDs };
    const response = await this.client.query(query, variables) as { mediasByIDs: MediaEntity[] };
    return response.mediasByIDs;
  }

  async getMediasBySlugs(slugs: string[]): Promise<MediaEntity[]> {
    const query = mediaQueries.GET_MEDIAS_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query(query, variables) as { mediasBySlugs: MediaEntity[] };
    return response.mediasBySlugs;
  }

  async getMediaByUniqRef(uniqRef: string): Promise<MediaEntity> {
    const query = mediaQueries.GET_MEDIA_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query(query, variables) as { mediaByUniqRef: MediaEntity };
    return response.mediaByUniqRef;
  }
} 