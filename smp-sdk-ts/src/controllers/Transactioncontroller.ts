// smp-sdk-ts/src/transaction/transaction.ts

import { APIClient } from '../api/APIClient';
import { transactionQueries } from '../api/graphql/queries/accounting/transactionQueries';

/**
 * The `Transaction` class manages transaction-related requests within the application.
 * It utilizes an `APIClient` to interact with the GraphQL API, providing methods
 * to retrieve, list, and search transactions based on various criteria.
 */
export class Transaction {
  private client: APIClient;

  /**
   * Initializes the `Transaction` class with an `APIClient` for requests.
   * @param client - An instance of `APIClient` for GraphQL requests.
   */
  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Retrieves a list of transactions with optional pagination, sorting, and filters.
   * @param pagination - Pagination parameters for the request.
   * @param sort - Sorting parameters for the transactions.
   * @param filter - Filters to refine the list of transactions.
   * @returns A list of transactions.
   */
  async list(pagination?: any, sort?: any, filter?: any): Promise<any[]> {
    const query = transactionQueries.GET_TRANSACTIONS;
    const variables = { pagination, sort, filter };
    const response = await this.client.query(query, variables) as  { transactions: any[] };
    return response.transactions;
  }

  /**
   * Fetches a transaction by its unique ID.
   * @param transactionID - The ID of the transaction to retrieve.
   * @returns The details of the transaction.
   */
  async getById(transactionID: string): Promise<any> {
    const query = transactionQueries.GET_TRANSACTION_BY_ID;
    const variables = { transactionID };
    const response = await this.client.query(query, variables) as { data: { transaction: any } };
    return response.data.transaction;
  }

  /**
   * Fetches multiple transactions by an array of transaction IDs.
   * @param transactionIDs - An array of transaction IDs.
   * @returns A list of transactions.
   */
  async getByIDs(transactionIDs: string[]): Promise<any[]> {
    const query = transactionQueries.GET_TRANSACTIONS_BY_IDS;
    const variables = { transactionIDs };
    const response = await this.client.query(query, variables) as { data: { transactionsByIDs: any[] } };
    return response.data.transactionsByIDs;
  }

  /**
   * Fetches a transaction by its unique reference (`uniqRef`).
   * @param uniqRef - The unique reference of the transaction.
   * @returns The details of the transaction.
   */
  async getByUniqRef(uniqRef: string): Promise<any> {
    const query = transactionQueries.GET_TRANSACTION_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query(query, variables) as { data: { transactionByUniqRef: any } };
    return response.data.transactionByUniqRef;
  }

  /**
   * Fetches a transaction by its slug.
   * @param slug - The slug of the transaction.
   * @returns The details of the transaction.
   */
  async getBySlug(slug: string): Promise<any> {
    const query = transactionQueries.GET_TRANSACTION_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query(query, variables) as { data: { transactionBySlug: any } };
    return response.data.transactionBySlug;
  }

  /**
   * Fetches multiple transactions by their slugs.
   * @param slugs - An array of transaction slugs.
   * @returns A list of transactions.
   */
  async getBySlugs(slugs: string[]): Promise<any[]> {
    const query = transactionQueries.GET_TRANSACTIONS_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query(query, variables) as { data: { transactionsBySlugs: any[] } };
    return response.data.transactionsBySlugs;
  }
}
