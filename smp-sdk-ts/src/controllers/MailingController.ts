// src/api/controllers/Mailing.ts
import { mailingQueries } from '../api/graphql/queries/notification/mailingQueries';
import { mailingMutations } from '../api/graphql/mutations/notification/mailingMutations';
import { APIClient } from '../api/APIClient';

//
// Types des réponses et inputs pour les campagnes
//

export interface Campaign {
  campaignID: string;
  uniqRef: string;
  slug: string;
  emailCampaignTemplateID: string;
  subject: string;
  contentHTML?: string;
  contentText?: string;
  groupIDs?: string[];
  scheduledAt?: string;
  sentAt?: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCampaignInput {
  emailCampaignTemplateID: string;
  subject: string;
  contentHTML?: string;
  contentText?: string;
  groupIDs?: string[];
  scheduledAt?: string;
  state?: string;
}

export interface UpdateCampaignInput {
  subject?: string;
  contentHTML?: string;
  contentText?: string;
  groupIDs?: string[];
  scheduledAt?: string;
  sentAt?: string;
  state?: string;
}

//
// Types des réponses et inputs pour les newsletters
//

export interface Newsletter {
  newsletterID: string;
  uniqRef: string;
  slug: string;
  emailNewsletterTemplateID: string;
  subject: string;
  contentHTML?: string;
  contentText?: string;
  scheduledAt?: string;
  sentAt?: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateNewsletterInput {
  emailNewsletterTemplateID: string;
  subject: string;
  contentHTML?: string;
  contentText?: string;
  scheduledAt?: string;
  state?: string;
}

export interface UpdateNewsletterInput {
  subject?: string;
  contentHTML?: string;
  contentText?: string;
  scheduledAt?: string;
  sentAt?: string;
  state?: string;
}

//
// Types des réponses et inputs pour les contacts newsletter
//

export interface NewsletterContact {
  newsletterContactID: string;
  userID?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isNewsletterSubscriber: boolean;
  source?: string;
  country?: string;
  gender?: string;
  birthDate?: string;
  state: string;
  slug: string;
  uniqRef: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateNewsletterContactInput {
  userID?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isNewsletterSubscriber?: boolean;
  source?: string;
  country?: string;
  gender?: string;
  birthDate?: string;
  state?: string;
}

export interface UpdateNewsletterContactInput {
  userID?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isNewsletterSubscriber?: boolean;
  source?: string;
  country?: string;
  gender?: string;
  birthDate?: string;
  state?: string;
}

//
// Controller Mailing
//

/**
 * La classe Mailing gère les appels API liés aux campagnes, newsletters et contacts newsletter.
 */
export class Mailing {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  // =========================== QUERIES ===========================

  async getCampaignById(campaignID: string): Promise<Campaign> {
    const variables = { campaignID };
    const response = await this.client.query(
      mailingQueries.GET_CAMPAIGN_BY_ID,
      variables
    ) as { campaign: Campaign };
    return response.campaign;
  }

  async getNewsletterById(newsletterID: string): Promise<Newsletter> {
    const variables = { newsletterID };
    const response = await this.client.query(
      mailingQueries.GET_NEWSLETTER,
      variables
    ) as { newsletter: Newsletter };
    return response.newsletter;
  }

  async getNewsletterContactsByUserID(userID: string): Promise<NewsletterContact[]> {
    const variables = { userID };
    const response = await this.client.query(
      mailingQueries.GET_NEWSLETTER_CONTACTS_BY_USER_ID,
      variables
    ) as { newsletterContactsByUserID: NewsletterContact[] };
    return response.newsletterContactsByUserID;
  }

  // =========================== MUTATIONS ===========================

  // Campagnes
  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    const variables = { input };
    const response = await this.client.mutate(
      mailingMutations.CREATE_CAMPAIGN,
      variables
    ) as { createCampaign: Campaign };
    return response.createCampaign;
  }

  async updateCampaign(campaignID: string, input: UpdateCampaignInput): Promise<Campaign> {
    const variables = { campaignID, input };
    const response = await this.client.mutate(
      mailingMutations.UPDATE_CAMPAIGN,
      variables
    ) as { updateCampaign: Campaign };
    return response.updateCampaign;
  }

  async deleteCampaign(campaignID: string): Promise<boolean> {
    const variables = { campaignID };
    const response = await this.client.mutate(
      mailingMutations.DELETE_CAMPAIGN,
      variables
    ) as { deleteCampaign: boolean };
    return response.deleteCampaign;
  }

  // Newsletters
  async createNewsletter(input: CreateNewsletterInput): Promise<Newsletter> {
    const variables = { input };
    const response = await this.client.mutate(
      mailingMutations.CREATE_NEWSLETTER,
      variables
    ) as { createNewsletter: Newsletter };
    return response.createNewsletter;
  }

  async updateNewsletter(newsletterID: string, input: UpdateNewsletterInput): Promise<Newsletter> {
    const variables = { newsletterID, input };
    const response = await this.client.mutate(
      mailingMutations.UPDATE_NEWSLETTER,
      variables
    ) as { updateNewsletter: Newsletter };
    return response.updateNewsletter;
  }

  async deleteNewsletter(newsletterID: string): Promise<boolean> {
    const variables = { newsletterID };
    const response = await this.client.mutate(
      mailingMutations.DELETE_NEWSLETTER,
      variables
    ) as { deleteNewsletter: boolean };
    return response.deleteNewsletter;
  }

  // Contacts Newsletter
  async createNewsletterContact(input: CreateNewsletterContactInput): Promise<NewsletterContact> {
    const variables = { input };
    const response = await this.client.mutate(
      mailingMutations.CREATE_NEWSLETTER_CONTACT,
      variables
    ) as { createNewsletterContact: NewsletterContact };
    return response.createNewsletterContact;
  }

  async updateNewsletterContact(newsletterContactID: string, input: UpdateNewsletterContactInput): Promise<NewsletterContact> {
    const variables = { newsletterContactID, input };
    const response = await this.client.mutate(
      mailingMutations.UPDATE_NEWSLETTER_CONTACT,
      variables
    ) as { updateNewsletterContact: NewsletterContact };
    return response.updateNewsletterContact;
  }

  async deleteNewsletterContact(newsletterContactID: string): Promise<boolean> {
    const variables = { newsletterContactID };
    const response = await this.client.mutate(
      mailingMutations.DELETE_NEWSLETTER_CONTACT,
      variables
    ) as { deleteNewsletterContact: boolean };
    return response.deleteNewsletterContact;
  }
}
