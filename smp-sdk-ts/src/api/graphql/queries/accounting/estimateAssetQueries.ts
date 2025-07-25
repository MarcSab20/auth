// smp-sdk-ts/src/api/graphql/queries/estimateAssetQueries.js

const estimateAssetQueries = {
    // QUERY TO GET A LIST OF ESTIMATE ASSETS WITH OPTIONAL PAGINATION, SORTING, AND FILTERING
    GET_ESTIMATE_ASSETS: `
      query GetEstimateAssets($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
        estimateAssets(pagination: $pagination, sort: $sort, filter: $filter) {
          estimateAssetID
          uniqRef
          slug
          legend
          assetID
          estimateID
          mandadtry
          initialPrice
          quantity
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET A SINGLE ESTIMATE ASSET BY ITS UNIQUE ID
    GET_ESTIMATE_ASSET_BY_ID: `
      query GetEstimateAssetByID($estimateAssetID: ID!) {
        estimateAssetByID(estimateAssetID: $estimateAssetID) {
          estimateAssetID
          uniqRef
          slug
          legend
          assetID
          estimateID
          mandadtry
          initialPrice
          quantity
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET MULTIPLE ESTIMATE ASSETS BY AN ARRAY OF ESTIMATE ASSET IDS
    GET_ESTIMATE_ASSETS_BY_IDS: `
      query GetEstimateAssetsByIDs($estimateAssetIDs: [ID!]!) {
        estimateAssetsByIDs(estimateAssetIDs: $estimateAssetIDs) {
          estimateAssetID
          uniqRef
          slug
          legend
          assetID
          estimateID
          mandadtry
          initialPrice
          quantity
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET AN ESTIMATE ASSET BY ITS UNIQUE REFERENCE
    GET_ESTIMATE_ASSET_BY_UNIQ_REF: `
      query GetEstimateAssetByUniqRef($uniqRef: String!) {
        estimateAssetByUniqRef(uniqRef: $uniqRef) {
          estimateAssetID
          uniqRef
          slug
          legend
          assetID
          estimateID
          mandadtry
          initialPrice
          quantity
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET AN ESTIMATE ASSET BY ITS SLUG
    GET_ESTIMATE_ASSET_BY_SLUG: `
      query GetEstimateAssetBySlug($slug: String!) {
        estimateAssetBySlug(slug: $slug) {
          estimateAssetID
          uniqRef
          slug
          legend
          assetID
          estimateID
          mandadtry
          initialPrice
          quantity
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET MULTIPLE ESTIMATE ASSETS BY SLUGS
    GET_ESTIMATE_ASSETS_BY_SLUGS: `
      query GetEstimateAssetsBySlugs($slugs: [String!]!) {
        estimateAssetsBySlugs(slugs: $slugs) {
          estimateAssetID
          uniqRef
          slug
          legend
          assetID
          estimateID
          mandadtry
          initialPrice
          quantity
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `
  };
  
  export { estimateAssetQueries };
  