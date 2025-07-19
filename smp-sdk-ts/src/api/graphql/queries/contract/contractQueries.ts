const contractQueries = {
  GET_CONTRACT_BY_ID: `
    query GetContract($id: String!) {
      contract(id: $id) {
        contractId
        estimateId
        serviceId
        organizationId
        clientSignHash
        providerSignHash
        status
        content
        variables
        details
        clientSignDate
        providerSignDate
        createdAt
        updatedAt
      }
    }
  `,

  GET_ALL_CONTRACTS: `
    query GetAllContracts {
      contracts {
        contractId
        estimateId
        serviceId
        organizationId
        clientSignHash
        providerSignHash
        status
        content
        variables
        details
        clientSignDate
        providerSignDate
        createdAt
        updatedAt
      }
    }
  `,

  GET_CONTRACTS_BY_ORGANIZATION_ID: `
    query GetContractsByOrganizationId($organizationId: String!) {
      contractsByOrganizationId(organizationId: $organizationId) {
        contractId
        estimateId
        serviceId
        organizationId
        clientSignHash
        providerSignHash
        status
        content
        variables
        details
        clientSignDate
        providerSignDate
        createdAt
        updatedAt
      }
    }
  `,
};

export { contractQueries }; 