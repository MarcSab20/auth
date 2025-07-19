// smp-sdk-ts/src/notification/notification.ts

import { APIClient } from '../api/APIClient';
import { notificationQueries } from '../api/graphql/queries/notification/notificationQueries';

/**
 * The `Notification` class manages notification-related requests within the application.
 */
export class Notification {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async list(pagination?: any, sort?: any, filter?: any): Promise<any[]> {
    const query = notificationQueries.GET_NOTIFICATIONS;
    const variables = { pagination, sort, filter };
    const response = await this.client.query(query, variables) as { data: { notifications: any[] } };
    return response.data.notifications;
  }

  async getById(notificationID: string): Promise<any> {
    const query = notificationQueries.GET_NOTIFICATION_BY_ID;
    const variables = { notificationID };
    const response = await this.client.query(query, variables) as { data: { notificationByID: any } };
    return response.data.notificationByID;
  }

  async getByIDs(notificationIDs: string[]): Promise<any[]> {
    const query = notificationQueries.GET_NOTIFICATIONS_BY_IDS;
    const variables = { notificationIDs };
    const response = await this.client.query(query, variables) as { data: { notificationsByIDs: any[] } };
    return response.data.notificationsByIDs;
  }

  async getByUniqRef(uniqRef: string): Promise<any> {
    const query = notificationQueries.GET_NOTIFICATION_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query(query, variables) as { data: { notificationByUniqRef: any } };
    return response.data.notificationByUniqRef;
  }

  async getBySlug(slug: string): Promise<any> {
    const query = notificationQueries.GET_NOTIFICATION_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query(query, variables) as { data: { notificationBySlug: any } };
    return response.data.notificationBySlug;
  }

  async getBySlugs(slugs: string[]): Promise<any[]> {
    const query = notificationQueries.GET_NOTIFICATIONS_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query(query, variables) as { data: { notificationsBySlugs: any[] } };
    return response.data.notificationsBySlugs;
  }
}
