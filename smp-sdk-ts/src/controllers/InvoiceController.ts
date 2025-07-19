// smp-sdk-ts/src/invoice/invoice.ts

import { APIClient } from '../api/APIClient';
import { invoiceQueries } from '../api/graphql/queries/accounting/invoiceQueries';

interface InvoiceResponse {
  invoiceId: string;
  uniqRef: string;
  transactionId: string;
  slug: string;
  orderId: string;
  thirdPartyFees: number;
  servicesFees: number;
  servicesVatPercent: number;
  prestationsVatPercent: number;
  totalAmount: number;
  sellerOrganizationId: string;
  paymentStatus: string;
  emittedDate: string;
  dueDate: string;
  digitalSignature: string;
  state: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  transactionData?: string;
  notes?: string;
  disclaimers?: string;
  paymentTerms?: string;
  profile?: string;
  header?: {
    id: string;
    invoiceNumber: string;
    name: string;
    invoiceDate: string;
    issueDate: string;
    typeCode: string;
    notes: Array<{
      heading: string;
      note: string;
    }>;
  };
  seller?: {
    name: string;
    postalAddress: {
      line1: string;
      city: string;
      postalCode: string;
      countryCode: string;
      line2?: string;
    };
    vatNumber?: string;
    contacts: Array<{
      contactName: string;
      contactEmail?: string;
      contactPhoneNumber?: string;
      divisionName?: string;
    }>;
  };
  buyer?: {
    name: string;
    postalAddress: {
      line1: string;
      city: string;
      postalCode: string;
      countryCode: string;
      line2?: string;
    };
    vatNumber?: string;
    contacts: Array<{
      contactName: string;
      contactEmail?: string;
      contactPhoneNumber?: string;
      divisionName?: string;
    }>;
  };
  payment?: {
    paymentMeansCode: string;
    payeeIBAN?: string;
    payeeBIC?: string;
    dueDate?: string;
    paymentTermsText?: string;
  };
  lines?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    taxCategoryCode: string;
    unitCode: string;
    allowances: number;
    charges: Array<{
      chargeIndicator: boolean;
      actualAmount: number;
      reason?: string;
      reasonCode?: string;
      taxRate?: number;
      taxCategoryCode?: string;
      startDate?: string;
      endDate?: string;
      percentage?: number;
    }>;
  }>;
  deliveryParty?: {
    name: string;
    postalAddress: {
      line1: string;
      city: string;
      postalCode: string;
      countryCode: string;
      line2?: string;
    };
    vatNumber?: string;
    contacts: Array<{
      contactName: string;
      contactEmail?: string;
      contactPhoneNumber?: string;
      divisionName?: string;
    }>;
  };
  payeeParty?: {
    name: string;
    postalAddress: {
      line1: string;
      city: string;
      postalCode: string;
      countryCode: string;
      line2?: string;
    };
    vatNumber?: string;
    contacts: Array<{
      contactName: string;
      contactEmail?: string;
      contactPhoneNumber?: string;
      divisionName?: string;
    }>;
  };
  buyerOrganizationId?: string;
  additionalDocuments?: Array<{
    documentTypeCode: string;
    id?: string;
    name: string;
    attachmentPath: string;
  }>;
  docAllowanceCharges?: Array<{
    chargeIndicator: boolean;
    actualAmount: number;
    reason?: string;
    reasonCode?: string;
    taxRate?: number;
    taxCategoryCode?: string;
    startDate?: string;
    endDate?: string;
    percentage?: number;
  }>;
  currency?: string;
  taxTotals?: Array<{
    taxCategory: string;
    taxRate: number;
    taxableAmount: number;
    taxAmount: number;
  }>;
}

interface CreateInvoiceResponse {
  createInvoice: InvoiceResponse;
}

interface GetInvoiceResponse {
  invoice: InvoiceResponse;
}

interface GetInvoicesResponse {
  invoices: InvoiceResponse[];
}

/**
 * The `Invoice` class handles invoice-related requests within the application.
 * It utilizes an `APIClient` to interact with the GraphQL API and provides methods
 * for retrieving, listing, and searching invoices based on various criteria.
 */
export class Invoice {
  private client: APIClient;

  /**
   * Initializes the `Invoice` class with an `APIClient` for requests.
   * @param client - An instance of `APIClient` for GraphQL requests.
   */
  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Creates a new invoice
   */
  async create(data: {
    orderId: string;
    currency: string;
    totalAmount: number;
    sellerOrganizationId: string;
    emittedDate: string;
    dueDate: string;
    transactionId: string;
    transactionData?: string;
    notes?: string;
  }): Promise<InvoiceResponse> {
    const query = invoiceQueries.CREATE_INVOICE;
    const response = await this.client.mutate<CreateInvoiceResponse>(query, { input: data });
    return response.createInvoice;
  }

  /**
   * Retrieves an invoice by its ID
   */
  async getById(invoiceId: string): Promise<InvoiceResponse> {
    const query = invoiceQueries.GET_INVOICE_BY_ID;
    const response = await this.client.query<GetInvoiceResponse>(query, { invoiceId });
    return response.invoice;
  }

  /**
   * Retrieves all invoices
   */
  async list(): Promise<InvoiceResponse[]> {
    const query = invoiceQueries.GET_INVOICES;
    const response = await this.client.query<GetInvoicesResponse>(query);
    return response.invoices;
  }

  /**
   * Fetches multiple invoices by an array of invoice IDs.
   * @param invoiceIDs - An array of invoice IDs.
   * @returns A list of invoices.
   */
  async getByIDs(invoiceIDs: string[]) {
    const query = invoiceQueries.GET_INVOICES_BY_IDS;
    const variables = { invoiceIDs };
    const response = await this.client.query(query, variables) as { data: { invoicesByIDs: any[] } };
    return response.data.invoicesByIDs;
  }

  /**
   * Fetches an invoice by its unique reference (`uniqRef`).
   * @param uniqRef - The unique reference of the invoice.
   * @returns The details of the invoice.
   */
  async getByUniqRef(uniqRef: string) {
    const query = invoiceQueries.GET_INVOICE_BY_UNIQ_REF;
    const variables = { uniqRef };
    const response = await this.client.query(query, variables) as { data: { invoiceByUniqRef: any } };
    return response.data.invoiceByUniqRef;
  }

  /**
   * Fetches an invoice by its slug.
   * @param slug - The slug of the invoice.
   * @returns The details of the invoice.
   */
  async getBySlug(slug: string) {
    const query = invoiceQueries.GET_INVOICE_BY_SLUG;
    const variables = { slug };
    const response = await this.client.query(query, variables) as { data: { invoiceBySlug: any } };
    return response.data.invoiceBySlug;
  }

  /**
   * Fetches multiple invoices by their slugs.
   * @param slugs - An array of invoice slugs.
   * @returns A list of invoices.
   */
  async getBySlugs(slugs: string[]) {
    const query = invoiceQueries.GET_INVOICES_BY_SLUGS;
    const variables = { slugs };
    const response = await this.client.query(query, variables) as { data: { invoicesBySlugs: any[] } };
    return response.data.invoicesBySlugs;
  }
}
