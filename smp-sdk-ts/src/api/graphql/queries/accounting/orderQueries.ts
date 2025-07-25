// src/api/graphql/queries/orderQueries.ts
const orderQueries = {
    // Query pour récupérer tous les orders
    ORDERS: `
      query Orders {
        orders {
          orderId
          quoteId
          userId
          totalPrice
          status
          unloggedUser
          lines {
            orderAssetId
            assetId
            quantity
            unitPrice
            title
            description
            legalVatPercent
            details
          }
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
    // Query pour récupérer un order par son orderId
    ORDER: `
      query Order($orderId: String!) {
        order(orderId: $orderId) {
          orderId
          quoteId
          userId
          totalPrice
          status
          unloggedUser
          lines {
            orderAssetId
            assetId
            quantity
            unitPrice
            title
            description
            legalVatPercent
            details
          }
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
    // Query pour récupérer les orders d'un utilisateur
    ORDERS_BY_USER: `
      query OrdersByUser($userId: String!) {
        ordersByUser(userId: $userId) {
          orderId
          quoteId
          userId
          totalPrice
          status
          unloggedUser
          lines {
            orderAssetId
            assetId
            quantity
            unitPrice
            title
            description
            legalVatPercent
            details
          }
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  };
  
  export { orderQueries };
  