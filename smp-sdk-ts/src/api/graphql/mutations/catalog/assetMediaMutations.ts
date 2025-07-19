const assetMediaMutations = {
  CREATE_ASSET_MEDIA: `
    mutation CreateAssetMedia($input: CreateAssetMediaInput!) {
      createAssetMedia(input: $input) {
        assetMediaID
        assetID
        mediaID
        listingPosition
        legend
        state
        media {
          url
        }
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  UPDATE_ASSET_MEDIA: `
    mutation UpdateAssetMedia($assetMediaID: ID!, $input: UpdateAssetMediaInput!) {
      updateAssetMedia(assetMediaID: $assetMediaID, input: $input) {
        assetMediaID
        assetID
        mediaID
        listingPosition
        legend
        state
        media {
          url
        }
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  DELETE_ASSET_MEDIA: `
    mutation DeleteAssetMedia($assetMediaID: ID!) {
      deleteAssetMedia(assetMediaID: $assetMediaID) {
        success
        message
      }
    }
  `
};

export { assetMediaMutations }; 