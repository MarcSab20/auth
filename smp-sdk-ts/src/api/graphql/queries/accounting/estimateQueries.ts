// smp-sdk-ts/src/api/graphql/queries/estimateQueries.js

const estimateQueries = {
    GET_ESTIMATES: `
      query GetEstimates($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
        estimates(pagination: $pagination, sort: $sort, filter: $filter) {
          estimateID
          uniqRef
          slug
          authorID
          operatorUserID
          buyerOrganizationID
          sellerOrganizationID
          serviceID
          expirationDueDate
          expirationTimeLeft
          referencePrice
          previewPrice
          proposedPrice
          comment
          negociatedPrice
          discountID
          propositionCount
          lastProposition
          stage
          state
          createdAt
          updatedAt
        }
      }
    `,
  
    GET_ESTIMATE_BY_ID: `
      query GetEstimate($estimateId: String!) {
        estimate(id: $estimateId) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationCount
          clientSignDate
          providerSignDate
          createdAt
          updatedAt
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
        }
      }
    `,
  
    GET_ESTIMATE_BY_UNIQ_REF: `
      query GetEstimateByUniqRef($uniqRef: String!) {
        estimateByUniqRef(uniqRef: $uniqRef) {
          estimateID
          uniqRef
          slug
          authorID
          operatorUserID
          buyerOrganizationID
          sellerOrganizationID
          serviceID
          expirationDueDate
          expirationTimeLeft
          referencePrice
          previewPrice
          proposedPrice
          comment
          negociatedPrice
          discountID
          propositionCount
          lastProposition
          stage
          state
          createdAt
          updatedAt
        }
      }
    `,
  
    GET_ESTIMATE_BY_SLUG: `
      query GetEstimateBySlug($slug: String!) {
        estimateBySlug(slug: $slug) {
          estimateID
          uniqRef
          slug
          authorID
          operatorUserID
          buyerOrganizationID
          sellerOrganizationID
          serviceID
          expirationDueDate
          expirationTimeLeft
          referencePrice
          previewPrice
          proposedPrice
          comment
          negociatedPrice
          discountID
          propositionCount
          lastProposition
          stage
          state
          createdAt
          updatedAt
        }
      }
    `,
  
    GET_ESTIMATES_BY_IDS: `
      query GetEstimatesByIDs($estimateIDs: [String!]!) {
        estimatesByIDs(estimateIDs: $estimateIDs) {
          estimateID
          uniqRef
          slug
          authorID
          operatorUserID
          buyerOrganizationID
          sellerOrganizationID
          serviceID
          expirationDueDate
          expirationTimeLeft
          referencePrice
          previewPrice
          proposedPrice
          comment
          negociatedPrice
          discountID
          propositionCount
          lastProposition
          stage
          state
          createdAt
          updatedAt
        }
      }
    `,
  
    GET_ESTIMATES_BY_SLUGS: `
      query GetEstimatesBySlugs($slugs: [String!]!) {
        estimatesBySlugs(slugs: $slugs) {
          estimateID
          uniqRef
          slug
          authorID
          operatorUserID
          buyerOrganizationID
          sellerOrganizationID
          serviceID
          expirationDueDate
          expirationTimeLeft
          referencePrice
          previewPrice
          proposedPrice
          comment
          negociatedPrice
          discountID
          propositionCount
          lastProposition
          stage
          state
          createdAt
          updatedAt
        }
      }
    `,

    CREATE_ESTIMATE: `
      mutation CreateEstimate($data: CreateEstimateInput!) {
        createEstimate(data: $data) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationCount
          clientSignDate
          providerSignDate
          createdAt
          updatedAt
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
        }
      }
    `,

    UPDATE_ESTIMATE: `
      mutation UpdateEstimate($id: String!, $data: UpdateEstimateInput!) {
        updateEstimate(id: $id, data: $data) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationCount
          clientSignDate
          providerSignDate
          createdAt
          updatedAt
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
        }
      }
    `,

    VALIDATE_ESTIMATE: `
      mutation ValidateEstimate($data: ValidateEstimateInput!) {
        validateEstimate(data: $data) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationCount
          clientSignDate
          providerSignDate
          createdAt
          updatedAt
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
        }
      }
    `,

    GET_ESTIMATES_BY_BUYER_USER_ID: `
      query GetEstimatesByBuyerUserId($buyerUserId: String!) {
        estimatesByBuyerUserId(buyerUserId: $buyerUserId) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationCount
          clientSignDate
          providerSignDate
          createdAt
          updatedAt
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
        }
      }
    `,

    GET_ESTIMATES_BY_BUYER_ORGANIZATION_ID: `
      query GetEstimatesByBuyerOrganizationId($buyerOrganizationId: String!) {
        estimatesByBuyerOrganizationId(buyerOrganizationId: $buyerOrganizationId) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationCount
          clientSignDate
          providerSignDate
          createdAt
          updatedAt
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
        }
      }
    `,

    GET_ESTIMATES_BY_SELLER_ORGANIZATION_ID: `
      query GetEstimatesBySellerOrganizationId($sellerOrganizationId: String!) {
        estimatesBySellerOrganizationId(sellerOrganizationId: $sellerOrganizationId) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationCount
          clientSignDate
          providerSignDate
          createdAt
          updatedAt
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
        }
      }
    `,

    // Negotiation Queries
    GET_NEGOTIATION_HISTORY: `
      query GetNegotiationHistory($estimateId: String!) {
        getNegotiationHistory(estimateId: $estimateId) {
          id
          estimateId
          proposedPrice
          details
          iterationCount
          status
          proposedBy
          createdAt
          updatedAt
        }
      }
    `,

    GET_CURRENT_NEGOTIATION: `
      query GetCurrentNegotiation($estimateId: String!) {
        getCurrentNegotiation(estimateId: $estimateId) {
          id
          estimateId
          proposedPrice
          details
          iterationCount
          status
          proposedBy
          createdAt
          updatedAt
        }
      }
    `,

    // Negotiation Mutations
    CREATE_NEGOTIATION: `
      mutation CreateNegotiation($input: CreateNegotiationInput!) {
        createNegotiation(input: $input) {
          estimate {
            estimateId
            serviceId
            proposalPrice
            details
            status
            negotiationStatus
            currentNegotiationId
            buyerUserId
            buyerOrganizationId
            sellerOrganizationId
            createdAt
            updatedAt
          }
          negotiation {
            id
            estimateId
            proposedPrice
            details
            iterationCount
            status
            proposedBy
            createdAt
            updatedAt
          }
        }
      }
    `,

    ACCEPT_NEGOTIATION: `
      mutation AcceptNegotiation($estimateId: String!) {
        acceptNegotiation(estimateId: $estimateId) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationStatus
          currentNegotiationId
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
          createdAt
          updatedAt
        }
      }
    `,

    REJECT_NEGOTIATION: `
      mutation RejectNegotiation($estimateId: String!) {
        rejectNegotiation(estimateId: $estimateId) {
          estimateId
          serviceId
          proposalPrice
          details
          status
          negotiationStatus
          currentNegotiationId
          buyerUserId
          buyerOrganizationId
          sellerOrganizationId
          createdAt
          updatedAt
        }
      }
    `
};
  
    
  
  export { estimateQueries };
  