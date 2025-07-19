const mediaQueries = {
  GET_MEDIA: `
    query GetMedia($mediaID: ID!) {
      media(mediaID: $mediaID) {
        mediaID
        uniqRef
        slug
        authorID
        mediaType
        legend
        summary
        originalName
        finalName
        url
        size
        entityID
        metadata
        entityName
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_MEDIAS: `
    query GetMedias($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      medias(pagination: $pagination, sort: $sort, filter: $filter) {
        mediaID
        uniqRef
        slug
        authorID
        mediaType
        legend
        summary
        originalName
        finalName
        url
        size
        entityID
        metadata
        entityName
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_MEDIA_BY_SLUG: `
    query GetMediaBySlug($slug: String!) {
      mediaBySlug(slug: $slug) {
        mediaID
        uniqRef
        slug
        authorID
        mediaType
        legend
        summary
        originalName
        finalName
        url
        size
        entityID
        metadata
        entityName
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_MEDIAS_BY_IDS: `
    query GetMediasByIds($mediaIDs: [ID!]!) {
      mediasByIDs(mediaIDs: $mediaIDs) {
        mediaID
        uniqRef
        slug
        authorID
        mediaType
        legend
        summary
        originalName
        finalName
        url
        size
        entityID
        metadata
        entityName
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_MEDIAS_BY_SLUGS: `
    query GetMediasBySlugs($slugs: [String!]!) {
      mediasBySlugs(slugs: $slugs) {
        mediaID
        uniqRef
        slug
        authorID
        mediaType
        legend
        summary
        originalName
        finalName
        url
        size
        entityID
        metadata
        entityName
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  GET_MEDIA_BY_UNIQ_REF: `
    query GetMediaByUniqRef($uniqRef: String!) {
      mediaByUniqRef(uniqRef: $uniqRef) {
        mediaID
        uniqRef
        slug
        authorID
        mediaType
        legend
        summary
        originalName
        finalName
        url
        size
        entityID
        metadata
        entityName
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `
};

export { mediaQueries };
