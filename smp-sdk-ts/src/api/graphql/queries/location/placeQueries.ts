const placeQueries = {
    GET_PLACE_BY_ID: `
        query Place($placeId: ID!) {
            place(placeID: $placeId) {
    placeID
    uniqRef
    slug
    authorID
    country
    region
    pstate
    city
    postalCode
    placeKind
    addressLine1
    addressLine2
    coordinates
    state
    createdAt
    updatedAt
  }
        }
    `,
};

export { placeQueries };