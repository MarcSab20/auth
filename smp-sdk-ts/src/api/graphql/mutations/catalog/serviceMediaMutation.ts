const serviceMediaMutations = {
  CREATE_SERVICE_MEDIA: `
    mutation CreateServiceMedia($input: CreateServiceMediaInput!) {
      createServiceMedia(input: $input) {
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

  UPDATE_SERVICE_MEDIA: `
    mutation UpdateServiceMedia($serviceMediaID: ID!, $input: UpdateServiceMediaInput!) {
      updateServiceMedia(serviceMediaID: $serviceMediaID, input: $input) {
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

  DELETE_SERVICE_MEDIA: `
    mutation DeleteServiceMedia($serviceMediaID: ID!) {
      deleteServiceMedia(serviceMediaID: $serviceMediaID) {
        success
        message
      }
    }
  `
};

export { serviceMediaMutations }; 