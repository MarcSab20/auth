const serviceMutations = {
    // MUTATION TO CREATE A SERVICE
    CREATE_SERVICE: `
      mutation CreateService($input: CreateServiceInput!) {
        createService(input: $input) {
          serviceID
          uniqRef
          slug
          authorID
          title
          description
          mediaBannerID
          termsAndConditionsID
          parentServiceID
          topicID
          organizationID
          locationID
          paymentConfigID
          price
          legalVatPercent
          lowerPrice
          upperPrice
          negotiable
          perimeter
          supplyType
          uptakeForm
          billingPlan
          onlineService
          advancedAttributes
          state
          createdAt
          updatedAt
          deletedAt
          serviceMedias {
            serviceMediaID
            listingPosition
            legend
            media {
              url
            }
          }
        }
      }
    `,
  
    // MUTATION TO UPDATE A SERVICE
    UPDATE_SERVICE: `
      mutation UpdateService($serviceID: ID!, $input: UpdateServiceInput!) {
        updateService(serviceID: $serviceID, input: $input) {
          serviceID
          uniqRef
          slug
          authorID
          title
          description
          mediaBannerID
          termsAndConditionsID
          parentServiceID
          topicID
          organizationID
          locationID
          paymentConfigID
          price
          legalVatPercent
          lowerPrice
          upperPrice
          negotiable
          perimeter
          supplyType
          uptakeForm
          billingPlan
          onlineService
          advancedAttributes
          state
          createdAt
          updatedAt
          deletedAt
          serviceMedias {
            serviceMediaID
            listingPosition
            legend
            media {
              url
            }
          }
        }
      }
    `,
  
    // MUTATION TO DELETE A SERVICE
    DELETE_SERVICE: `
      mutation DeleteService($serviceID: ID!) {
        deleteService(serviceID: $serviceID) {
          success
          message
        }
      }
    `,
    // MUTATION POUR AJOUTER UN SERVICE AUX FAVORIS
  ADD_SERVICE_TO_FAVORITES: `
  mutation AddServiceToFavorites($input: AddServiceToFavoritesInput!) {
    addServiceToFavorites(input: $input) {
      serviceID
      userID
      addedAt
    }
  }`,
  
  };
  
  export { serviceMutations };
  