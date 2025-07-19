 const serviceQueries = {
  GET_SERVICE_BY_AUTHOR_ID: `
    query GetServicesByUserId($authorID: String!) {
      servicessByUserId(userID: $authorID) {
        serviceID
        authorID
        organizationID
        title
        slug
        uniqRef
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
  GET_SERVICE_BY_ID: `
    query GetServiceByID($serviceID: ID!) {
      service(serviceID: $serviceID) {
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
  GET_SERVICE_BY_UNIQ_REF: `
    query GetServiceByUniqRef($uniqRef: String!) {
      serviceByUniqRef(uniqRef: $uniqRef) {
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
  GET_SERVICE_BY_SLUG: `
    query GetServiceBySlug($slug: String!) {
      serviceBySlug(slug: $slug) {
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
  GET_SERVICES_BY_IDS: `
    query GetServicesByIDs($serviceIDs: [String!]!) {
      servicesByIDs(serviceIDs: $serviceIDs) {
        serviceID
        uniqRef
        slug
        authorID
        title
        description
        mediaBannerID
        parentServiceID
        topicID
        organizationID
        locationID
        paymentConfigID
        price
        negotiable
        perimeter
        supplyType
        uptakeForm
        billingPlan
        onlineService
        state
        createdAt
        updatedAt
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
  GET_SERVICES_BY_SLUGS: `
    query GetServicesBySlugs($slugs: [String!]!) {
      servicesBySlugs(slugs: $slugs) {
        serviceID
        uniqRef
        slug
        authorID
        title
        description
        mediaBannerID
        parentServiceID
        topicID
        organizationID
        locationID
        paymentConfigID
        price
        negotiable
        perimeter
        supplyType
        uptakeForm
        billingPlan
        onlineService
        state
        createdAt
        updatedAt
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
  LIST_SERVICES_BY_ORGANIZATION: `
    query ListServicesByOrganization($input: ListServicesByOrganizationInput!) {
      listServicesByOrganization(input: $input) {
        serviceID
        uniqRef
        slug
        authorID
        title
        description
        mediaBannerID
        parentServiceID
        topicID
        organizationID
        locationID
        paymentConfigID
        price
        negotiable
        perimeter
        supplyType
        uptakeForm
        billingPlan
        onlineService
        upperPrice
        lowerPrice
        legalVatPercent
        advancedAttributes
        state
        createdAt
        updatedAt
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
  SEARCH_SERVICES: `
    query SearchServices($input: SearchServiceInput!) {
      searchServices(input: $input) {
        serviceID
        uniqRef
        slug
        authorID
        title
        description
        mediaBannerID
        parentServiceID
        topicID
        organizationID
        locationID
        paymentConfigID
        price
        negotiable
        perimeter
        supplyType
        uptakeForm
        billingPlan
        onlineService
        state
        createdAt
        updatedAt
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
  GET_SERVICES: `
    query GetServices($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      services(pagination: $pagination, sort: $sort, filter: $filter) {
        serviceID
        uniqRef
        slug
        authorID
        title
        description
        mediaBannerID
        parentServiceID
        topicID 
        organizationID
        locationID
        paymentConfigID
        price
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


};

export { serviceQueries };
