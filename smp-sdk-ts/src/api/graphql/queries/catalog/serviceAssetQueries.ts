const serviceAssetQueries = {
    // Récupère un ServiceAsset via son ID
    GET_SERVICE_ASSET: `
      query GetServiceAsset($serviceAssetID: ID!) {
        serviceAsset(serviceAssetID: $serviceAssetID) {
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
  
    // Récupère la liste des ServiceAssets (avec pagination, tri et filtres optionnels)
    GET_SERVICE_ASSETS: `
      query GetServiceAssets($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
        serviceAssets(pagination: $pagination, sort: $sort, filter: $filter) {
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
  
    // Récupère un ServiceAsset via son slug
    GET_SERVICE_ASSET_BY_SLUG: `
      query GetServiceAssetBySlug($slug: String!) {
        serviceAssetBySlug(slug: $slug) {
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
  
    // Récupère plusieurs ServiceAssets via un tableau d'IDs
    GET_SERVICE_ASSETS_BY_IDS: `
      query GetServiceAssetsByIDs($serviceAssetIDs: [ID!]!) {
        serviceAssetsByIDs(serviceAssetIDs: $serviceAssetIDs) {
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
  
    // Récupère plusieurs ServiceAssets via un tableau de slugs
    GET_SERVICE_ASSETS_BY_SLUGS: `
      query GetServiceAssetsBySlugs($slugs: [String!]!) {
        serviceAssetsBySlugs(slugs: $slugs) {
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
  
    // Récupère un ServiceAsset via sa référence unique
    GET_SERVICE_ASSET_BY_UNIQ_REF: `
      query GetServiceAssetByUniqRef($uniqRef: String!) {
        serviceAssetByUniqRef(uniqRef: $uniqRef) {
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
    `
  };
  
  export { serviceAssetQueries };
  