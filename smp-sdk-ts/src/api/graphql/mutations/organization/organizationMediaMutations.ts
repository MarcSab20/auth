export const CREATE_ORGANIZATION_MEDIA = `
  mutation CreateOrganizationMedia($input: CreateOrganizationMediaInput!) {
    createOrganizationMedia(input: $input) {
      organizationMediaID
      mediaID
      legend
      listingPosition
      state
      media {
        mediaID
        url
        originalName
        finalName
      }
    }
  }
`;

export const UPDATE_ORGANIZATION_MEDIA = `
  mutation UpdateOrganizationMedia($input: UpdateOrganizationMediaInput!) {
    updateOrganizationMedia(input: $input) {
      organizationMediaID
      mediaID
      legend
      listingPosition
      state
      media {
        mediaID
        url
        originalName
        finalName
      }
    }
  }
`;

export const DELETE_ORGANIZATION_MEDIA = `
  mutation DeleteOrganizationMedia($organizationMediaID: ID!) {
    deleteOrganizationMedia(organizationMediaID: $organizationMediaID) {
      success
    }
  }
`;

export const organizationMediaMutations = {
  CREATE_ORGANIZATION_MEDIA,
  UPDATE_ORGANIZATION_MEDIA,
  DELETE_ORGANIZATION_MEDIA,
}; 