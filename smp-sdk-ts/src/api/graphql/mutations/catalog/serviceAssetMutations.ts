const serviceAssetMutations = {
    // MUTATION POUR CRÉER UN SERVICE ASSET
    CREATE_SERVICE_ASSET: `
      mutation CreateServiceAsset($input: CreateServiceAssetInput!) {
        createServiceAsset(input: $input) {
          serviceAssetID
          uniqRef
          slug
          assetID
          serviceID
          legend
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // MUTATION POUR METTRE À JOUR UN SERVICE ASSET
    UPDATE_SERVICE_ASSET: `
      mutation UpdateServiceAsset($serviceAssetID: ID!, $input: UpdateServiceAssetInput!) {
        updateServiceAsset(serviceAssetID: $serviceAssetID, input: $input) {
          serviceAssetID
          uniqRef
          slug
          assetID
          serviceID
          legend
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // MUTATION POUR SUPPRIMER UN SERVICE ASSET
    DELETE_SERVICE_ASSET: `
      mutation DeleteServiceAsset($serviceAssetID: ID!) {
        deleteServiceAsset(serviceAssetID: $serviceAssetID) {
          success
          message
        }
      }
    `,

    
  };
  
  export { serviceAssetMutations };
  