const assetMutations = {
    // MUTATION POUR CRÉER UN ASSET
    CREATE_ASSET: `
      mutation CreateAsset($input: CreateAssetInput!) {
        createAsset(input: $input) {
          assetID
          uniqRef
          slug
          title
          authorID
          organizationID
          mediaID
          description
          price
          legalVatPercent
          quantity
          stockQuantity
          maxPerReservation
          conflictingAssets
          applyableAssets
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // MUTATION POUR METTRE À JOUR UN ASSET
    UPDATE_ASSET: `
      mutation UpdateAsset($assetID: ID!, $input: UpdateAssetInput!) {
        updateAsset(assetID: $assetID, input: $input) {
          assetID
          slug
          title
          authorID
          organizationID
          mediaID
          description
          price
          legalVatPercent
          quantity
          stockQuantity
          maxPerReservation
          conflictingAssets
          applyableAssets
          state
          createdAt
          updatedAt
        }
      }
    `,
  
    // MUTATION POUR SUPPRIMER UN ASSET
    DELETE_ASSET: `
      mutation DeleteAsset($assetID: ID!) {
        deleteAsset(assetID: $assetID) {
          success
          message
        }
      }
    `,
  };
  
  export { assetMutations };
  