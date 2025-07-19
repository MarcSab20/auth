const transactionMutations = {

    // MUTATION POUR CRÉER UNE TRANSACTION
    CREATE_TRANSACTION: `
  mutation Mutation($input: CreateTransactionInput!) {
    initiateTransaction(input: $input) {
      transactionId
      serviceId
      slug
      buyerUserId
      buyerOrganizationId
      sellerUserContactId
      sellerOrganizationId
      currency
      totalAmount
      state
      status
      metadata
      createdAt
      updatedAt
      deletedAt
    }
  }`,
    // MUTATION POUR METTRE À JOUR UNE TRANSACTION
    UPDATE_TRANSACTION: `
  mutation UpdateTransaction($transactionId: String!, $input: UpdateTransactionInput!) {
    updateTransaction(transactionId: $transactionId, input: $input) {
      transactionId
      serviceId
      slug
      buyerUserId
      buyerOrganizationId
      sellerUserContactId
      sellerOrganizationId
      currency
      totalAmount
      state
      status
      metadata
      createdAt
      updatedAt
      deletedAt
    }
  }`

};

export  {transactionMutations};