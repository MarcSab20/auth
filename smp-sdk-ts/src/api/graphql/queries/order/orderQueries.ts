export const orderQueries = {
  GET_ORDER_BY_ID: `
    query GetOrder($orderId: String!) {
      order(orderId: $orderId) {
        orderId
        userId
        sellerOrganizationId
        buyerOrganizationId
        transactionId
        destinationWalletId
        sourceWalletId
        currency
        quoteId
        serviceId
        status
        totalPrice
        createdAt
        updatedAt
        deletedAt
        unloggedUser
        lines {
          assetId
          quantity
          unitPrice
          details
          title
          description
          legalVatPercent
        }
      }
    }
  `,

  GET_ORDERS_BY_USER_ID: `
    query GetOrdersByUserId($userId: String!) {
      ordersByUser(userId: $userId) {
        orderId
        userId
        sellerOrganizationId
        buyerOrganizationId
        transactionId
        destinationWalletId
        sourceWalletId
        currency
        quoteId
        serviceId
        status
        totalPrice
        createdAt
        updatedAt
        deletedAt
        unloggedUser
        lines {
          assetId
          quantity
          unitPrice
          details
          title
          description
          legalVatPercent
        }
      }
    }
  `,

  GET_ORDERS_BY_SELLER_ORGANIZATION_ID: `
    query GetOrdersBySellerOrganizationId($sellerOrganizationId: String!) {
      ordersBySellerOrganization(sellerOrganizationId: $sellerOrganizationId) {
        orderId
        userId
        sellerOrganizationId
        buyerOrganizationId
        transactionId
        destinationWalletId
        sourceWalletId
        currency
        quoteId
        serviceId
        status
        totalPrice
        createdAt
        updatedAt
        deletedAt
        unloggedUser
        lines {
          assetId
          quantity
          unitPrice
          details
          title
          description
          legalVatPercent
        }
      }
    }
  `,

  GET_ORDERS_BY_BUYER_ORGANIZATION_ID: `
    query GetOrdersByBuyerOrganizationId($buyerOrganizationId: String!) {
      ordersByBuyerOrganization(buyerOrganizationId: $buyerOrganizationId) {
        orderId
        userId
        sellerOrganizationId
        buyerOrganizationId
        transactionId
        destinationWalletId
        sourceWalletId
        currency
        quoteId
        serviceId
        status
        totalPrice
        createdAt
        updatedAt
        deletedAt
        unloggedUser
        lines {
          assetId
          quantity
          unitPrice
          details
          title
          description
          legalVatPercent
        }
      }
    }
  `
}; 