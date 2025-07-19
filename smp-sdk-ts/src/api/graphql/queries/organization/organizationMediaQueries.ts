export const GET_ORGANIZATION_MEDIA = `
  query GetOrganizationMedia($organizationMediaID: ID!) {
    organizationMedia(organizationMediaID: $organizationMediaID) {
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

export const GET_ORGANIZATION_MEDIAS = `
  query GetOrganizationMedias($organizationID: ID!) {
    organizationMedias(filter: [{ field: "organizationID", value: $organizationID }]) {
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

export const organizationMediaQueries = {
  GET_ORGANIZATION_MEDIA,
  GET_ORGANIZATION_MEDIAS,
}; 