const placeMutations = {
    // MUTATION TO CREATE A PLACE
    CREATE_PLACE: `
        mutation CreatePlace($input: CreatePlaceInput!) {
            createPlace(input: $input) {
                placeID
          
            }
        }
    `,

    // MUTATION TO UPDATE A PLACE
    UPDATE_PLACE: `
        mutation UpdatePlace($placeId: ID!, $input: UpdatePlaceInput!) {
            updatePlace(placeID: $placeId, input: $input) {
                city
                country
            }
        }
    `
};

export { placeMutations };