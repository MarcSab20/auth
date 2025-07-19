export const assetMediaQueries = {
  GET_ASSET_MEDIA: `
    query GetAssetMedia($assetMediaID: ID!) {
      assetMedia(assetMediaID: $assetMediaID) {
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

  GET_ASSET_MEDIAS: `
    query GetAssetMedias($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      assetMedias(pagination: $pagination, sort: $sort, filter: $filter) {
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

  GET_ASSET_MEDIAS_BY_IDS: `
    query GetAssetMediasByIDs($assetMediaIDs: [ID!]!) {
      assetMediasByIDs(assetMediaIDs: $assetMediaIDs) {
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
  `
}; 