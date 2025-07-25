const mediaMutations = {
  CREATE_MEDIA: `
    mutation CreateMedia($input: CreateMediaInput!) {
      createMedia(input: $input) {
        mediaID
        authorID
        mediaType
        originalName
        finalName
        url
        size
        entityID
        entityName
        state
        createdAt
        updatedAt
        deletedAt
      }
    }
  `,

  UPDATE_MEDIA: `
    mutation UpdateMedia($mediaID: ID!, $input: UpdateMediaInput!) {
      updateMedia(mediaID: $mediaID, input: $input) {
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

  DELETE_MEDIA: `
    mutation DeleteMedia($mediaID: ID!) {
      deleteMedia(mediaID: $mediaID) {
        success
        message
      }
    }
  `
};

export { mediaMutations };
