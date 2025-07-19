const serviceMediaQueries = {
  GET_SERVICE_MEDIA: `
    query GetServiceMedia($serviceMediaID: ID!) {
      serviceMedia(serviceMediaID: $serviceMediaID) {
        serviceMediaID
        uniqRef
        slug
        mediaID
        serviceID
        legend
        listingPosition
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_SERVICE_MEDIAS: `
    query GetServiceMedias($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      serviceMedias(pagination: $pagination, sort: $sort, filter: $filter) {
        serviceMediaID
        uniqRef
        slug
        mediaID
        serviceID
        legend
        listingPosition
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_SERVICE_MEDIA_BY_SLUG: `
    query GetServiceMediaBySlug($slug: String!) {
      serviceMediaBySlug(slug: $slug) {
        serviceMediaID
        uniqRef
        slug
        mediaID
        serviceID
        legend
        listingPosition
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_SERVICE_MEDIAS_BY_IDS: `
    query GetServiceMediasByIds($serviceMediaIDs: [ID!]!) {
      serviceMediasByIDs(serviceMediaIDs: $serviceMediaIDs) {
        serviceMediaID
        uniqRef
        slug
        mediaID
        serviceID
        legend
        listingPosition
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_SERVICE_MEDIAS_BY_SLUGS: `
    query GetServiceMediasBySlugs($slugs: [String!]!) {
      serviceMediasBySlugs(slugs: $slugs) {
        serviceMediaID
        uniqRef
        slug
        mediaID
        serviceID
        legend
        listingPosition
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_SERVICE_MEDIA_BY_UNIQ_REF: `
    query GetServiceMediaByUniqRef($uniqRef: String!) {
      serviceMediaByUniqRef(uniqRef: $uniqRef) {
        serviceMediaID
        uniqRef
        slug
        mediaID
        serviceID
        legend
        listingPosition
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `
};

export { serviceMediaQueries }; 