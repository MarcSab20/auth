import { APIClient } from '../api/APIClient';
import { placeQueries } from '../api/graphql/queries/location/placeQueries';
import { placeMutations } from '../api/graphql/mutations/location/placeMutation';

// Types des réponses
export interface Place {
  placeID: string;
  uniqRef: string;
  slug: string;
  authorID: string ;
  country: string;
  region: string;
  pstate: string;
  city: string;
  postalCode: string;
  placeKind: string;
  addressLine1: string; 
  addressLine2: string;
  coordinates: string;
  state: string;
  createdAt: string;
  updatedAt: string; 
  deletedAt?: string; 
}

// Types des inputs pour les mutations
export interface CreatePlaceInput {
  state?: string | null;
  postalCode?: string | null;
  placeKind?: string | null;
  country?: string | null;
  addressLine1?: string | null;
  // coordinates?: string | null;
  city?: string | null;
  authorID?: number| string;
}

export interface UpdatePlaceInput {
  country?: string;
  region?: string;
  pstate?: string;
  city?: string;
  postalCode?: string;
  placeKind?: string;
  addressLine1?: string;
  addressLine2?: string;
  coordinates?: string;
  state?: string;
}

/**
 * The `Location` class manages place-related requests within the application.
 */
export class Location {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  //==========================  QUERIES  =============================================================

  /**
   * Fetches a single place by its ID.
   */
  async getById(placeId: string): Promise<Place> {
    const query = placeQueries.GET_PLACE_BY_ID;
    const variables = { placeId };
    const response = await this.client.query(query, variables) as { place: Place };
    return response.place;
  }

  //========================== MUTATIONS =============================================================

  /**
   * Creates a new place with the specified input.
   */
  async createPlace(input: CreatePlaceInput): Promise<Place> {
    const mutation = placeMutations.CREATE_PLACE;
    const variables = { input };
    const response = await this.client.mutate(mutation, variables) as { createPlace: Place };
    return response.createPlace;
  }

  /**
   * Updates an existing place by its ID with the specified input.
   */
  async updatePlace(placeId: string, input: UpdatePlaceInput): Promise<Place> {
    const mutation = placeMutations.UPDATE_PLACE;
    const variables = { placeId, input };
    const response = await this.client.mutate(mutation, variables) as  { updatePlace: Place };
    return response.updatePlace;
  }

  /**
   * Deletes a place by its ID.
   */
//   async deletePlace(placeId: string): Promise<boolean> {
//     const mutation = placeMutations.DELETE_PLACE;
//     const variables = { placeId };
//     const response = await this.client.mutate(mutation, variables) as { data: { deletePlace: boolean } };
//     return response.data.deletePlace;
//   }
}