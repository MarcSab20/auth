import { APIClient } from '../api/APIClient';
import { orderQueries } from '../api/graphql/queries/order/orderQueries';

interface OrderResponse {
  orderId: string;
  userId: string;
  sellerOrganizationId: string;
  buyerOrganizationId: string;
  transactionId: string;
  destinationWalletId: string;
  sourceWalletId: string;
  currency: string;
  quoteId: string;
  serviceId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  unloggedUser: any;
  lines: {
    assetId: string;
    quantity: number;
    unitPrice: number;
    details: any;
    title: string;
    description: string;
    legalVatPercent: number;
  }[];
}

interface GetOrderResponse {
  order: OrderResponse;
}

interface GetOrdersResponse {
  ordersByUser: OrderResponse[];
  ordersBySellerOrganization: OrderResponse[];
  ordersByBuyerOrganization: OrderResponse[];
}

export class Order {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Retrieves an order by its ID
   */
  async getById(orderId: string): Promise<OrderResponse> {
    const query = orderQueries.GET_ORDER_BY_ID;
    const response = await this.client.query<GetOrderResponse>(query, { orderId });
    return response.order;
  }

  /**
   * Retrieves orders by user ID
   */
  async getByUserId(userId: string): Promise<OrderResponse[]> {
    const query = orderQueries.GET_ORDERS_BY_USER_ID;
    const response = await this.client.query<{ ordersByUser: OrderResponse[] }>(query, { userId });
    return response.ordersByUser;
  }

  /**
   * Retrieves orders by seller organization ID
   */
  async getBySellerOrganizationId(sellerOrganizationId: string): Promise<OrderResponse[]> {
    const query = orderQueries.GET_ORDERS_BY_SELLER_ORGANIZATION_ID;
    const response = await this.client.query<{ ordersBySellerOrganization: OrderResponse[] }>(query, { sellerOrganizationId });
    return response.ordersBySellerOrganization;
  }

  /**
   * Retrieves orders by buyer organization ID
   */
  async getByBuyerOrganizationId(buyerOrganizationId: string): Promise<OrderResponse[]> {
    const query = orderQueries.GET_ORDERS_BY_BUYER_ORGANIZATION_ID;
    const response = await this.client.query<{ ordersByBuyerOrganization: OrderResponse[] }>(query, { buyerOrganizationId });
    return response.ordersByBuyerOrganization;
  }
} 