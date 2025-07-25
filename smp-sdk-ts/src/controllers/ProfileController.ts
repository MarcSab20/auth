import { APIClient } from '../api/APIClient';
import { profileMutations } from './../api/graphql/mutations/user-space/profileMutation';
import { profileQueries } from './../api/graphql/queries/user-space/profileQueries';

// Types d'entrée pour les mutations des profils
interface CreateProfileInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string; // ISO 8601 format
  gender?: string; // ProfileGender
  nationality?: string;
  phoneNumber?: string;
  locationID?: string;
  idCardNumber?: string;
  authorID: string;
  passportNumber?: string;
  socialSecurityNumber?: string;
  state: string; 
}

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  phoneNumber?: string;
  locationID?: string;
  idCardNumber?: string;
  passportNumber?: string;
  socialSecurityNumber?: string;
  state?: string; // ObjectStatus
  profilePictureID?: string;
}

interface MediaEntity {
  url: string;
}

// Types de réponse pour les mutations et les requêtes
interface ProfileEntity {
  profileID: string;
  uniqRef: string;
  slug: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phoneNumber: string;
  locationID: string;
  idCardNumber?: string;
  passportNumber?: string;
  socialSecurityNumber?: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  profilePicture?: MediaEntity;
  profilePictureID?: string;
}

interface MutationResponse {
  success: boolean;
  message: string;
}

// Contrôleur des mutations et des requêtes pour les profils
export class Profile {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  // ======================= MUTATIONS =======================

  async createProfile(input: CreateProfileInput): Promise<ProfileEntity> {
    const mutation = profileMutations.CREATE_PROFILE;
    const variables = { input };
    const response = await this.client.mutate(mutation, variables) as { createProfile: ProfileEntity };
    return response.createProfile;
  }

  async updateProfile(profileId: string, input: UpdateProfileInput): Promise<ProfileEntity> {
    const mutation = profileMutations.UPDATE_PROFILE;
    const variables = {profileId, input, };
    const response = await this.client.mutate(mutation, variables) as { updateProfile: ProfileEntity };
    return response.updateProfile;
  }
  
  async deleteProfile(profileID: string): Promise<MutationResponse> {
    const mutation = profileMutations.DELETE_PROFILE;
    const variables = { profileID };
    const response = await this.client.mutate(mutation, variables) as { deleteProfile: MutationResponse };
    return response.deleteProfile;
  }

  // ======================= QUERIES =======================

  async getProfile(profileId: string): Promise<ProfileEntity> {
    const query = profileQueries.GET_PROFILE;
    const variables = { profileId };
    const response = await this.client.query(query, variables) as { profile: ProfileEntity };
    return response.profile;
  }

  async list(): Promise<ProfileEntity[]> {
    const query = profileQueries.GET_PROFILES;
    const response = await this.client.query(query) as { profiles: ProfileEntity[] };
    return response.profiles;
  }

  async getProfileBySlug(slug: string): Promise<ProfileEntity> {
    const query = profileQueries.GET_PROFILE_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query(query, variables) as { profileBySlug: ProfileEntity };
    return response.profileBySlug;
  }

  async getProfileByUniqRef(uniqRef: string): Promise<ProfileEntity> {
    const query = profileQueries.GET_PROFILE_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query(query, variables) as { profileByUniqRef: ProfileEntity };
    return response.profileByUniqRef;
  }

  async getProfilesByIds(profileIDs: string[]): Promise<ProfileEntity[]> {
    const query = profileQueries.GET_PROFILES_BY_IDS;
    const variables = { profileIDs };
    const response = await this.client.query(query, variables) as { profilesByIDs: ProfileEntity[] };
    return response.profilesByIDs;
  }

  async getProfilesBySlugs(slugs: string[]): Promise<ProfileEntity[]> {
    const query = profileQueries.GET_PROFILES_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query(query, variables) as { profilesBySlugs: ProfileEntity[] };
    return response.profilesBySlugs;
  }
}
