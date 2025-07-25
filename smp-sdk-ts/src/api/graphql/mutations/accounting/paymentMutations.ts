// src/api/graphql/mutations/accounting/paymentMutations.ts
const paymentMutations = {
  // MUTATION POUR AJOUTER UNE LIGNE (order)
  ADD_LINE: `
    mutation AddLine($orderId: String!, $input: AddLineInput!) {
      addLine(orderId: $orderId, input: $input) {
        orderId
        quoteId
        userId
        totalPrice
        status
        unloggedUser
        createdAt
        updatedAt
        lines {
          orderAssetId
          assetId
          quantity
          unitPrice
          title
          description
          legalVatPercent
          
        }
      }
    }
  `,
  // MUTATION POUR SUPPRIMER UNE LIGNE (order)
  DELETE_LINE: `
    mutation DeleteLine($input: DeleteLineInput!) {
      deleteLine(input: $input) {
        orderId
        quoteId
        userId
        totalPrice
        status
        unloggedUser
        createdAt
        updatedAt
      }
    }
  `,
  // MUTATION POUR METTRE À JOUR UNE LIGNE (order)
  UPDATE_LINE: `
    mutation UpdateLine($orderId: String!, $assetId: String!, $updateData: UpdateLineDataInput!) {
      updateLine(orderId: $orderId, assetId: $assetId, updateData: $updateData) {
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
          
        }
        createdAt
        updatedAt
      }
    }
  `,
  // MUTATION POUR INITIER UN PAIEMENT
  INITIATE_PAYMENT: `
    mutation InitiatePayment($input: CreatePaymentDto!) {
      initiatePayment(input: $input) {
        success
        error
        code
        data {
          paymentIntent
          clientSecret
          amount
          currency
          orderId
          organizationId
          userId
          transfertId
          status
          metadata
          createdAt
        }
      }
    }
  `,
  // MUTATION POUR CRÉER UN ESTIMATE
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
  // MUTATION POUR METTRE À JOUR UN ESTIMATE
  UPDATE_ESTIMATE: `
    mutation UpdateEstimate($updateEstimateId: String!, $data: UpdateEstimateInput!) {
      updateEstimate(id: $updateEstimateId, data: $data) {
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
      }
    }
  `,
  // MUTATION POUR METTRE À JOUR UN CONTRAT
  UPDATE_CONTRACT: `
    mutation UpdateContract($updateContractId: String!, $data: UpdateContractInput!) {
      updateContract(id: $updateContractId, data: $data) {
        contractId
        estimateId
        serviceId
        clientSignHash
        providerSignHash
        status
        details
        clientSignDate
        providerSignDate
        createdAt
        updatedAt
      }
    }
  `,
  // MUTATION POUR CRÉER UN ORDER 
  CREATE_ORDER: `
    mutation CreateOrder($input: CreateOrderInput!) {
      createOrder(input: $input) {
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
          
        }
        createdAt
        
      }
    }
  `,
  // MUTATION POUR METTRE À JOUR UN ORDER
  UPDATE_ORDER: `
    mutation UpdateOrder($orderId: String!, $data: UpdateOrderInput!) {
      updateOrder(orderId: $orderId, data: $data) {
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
          
        }
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,
  // MUTATION POUR CONFIRMER UN ORDER
  CONFIRM_ORDER: `
    mutation ConfirmOrder($orderId: String!) {
      confirmOrder(orderId: $orderId) {
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
          
        }
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,
  // MUTATION POUR MARQUER UN ORDER COMME PAYÉ
  MARK_ORDER_PAID: `
    mutation MarkOrderPaid($orderId: String!) {
      markOrderPaid(orderId: $orderId) {
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
          
        }
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,
  // MUTATION POUR MARQUER UN ORDER COMME LIVRÉ
  MARK_ORDER_DELIVERED: `
    mutation MarkOrderDelivered($orderId: String!) {
      markOrderDelivered(orderId: $orderId) {
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
          
        }
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,
  // MUTATION POUR ANNULER UN ORDER
  CANCEL_ORDER: `
    mutation CancelOrder($orderId: String!) {
      cancelOrder(orderId: $orderId) {
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
          
        }
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,
};

export { paymentMutations };
