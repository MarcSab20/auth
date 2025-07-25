const assetQueries = {
  // Récupère un asset via son ID
  GET_ASSET: `
    query GetAsset($assetID: ID!) {
      asset(assetID: $assetID) {
        assetID
        uniqRef
        slug
        title
        authorID
        organizationID
        mediaID
        description
        price
        legalVatPercent
        quantity
        stockQuantity
        maxPerReservation
        conflictingAssets
        applyableAssets
        state
        createdAt
        updatedAt
        deletedAt
        medias {
          assetMediaID
          listingPosition
          legend
          state
          media {
            url
          }
        }
      }
    }
  `,

  // Récupère la liste de tous les assets avec pagination, tri et filtres éventuels
  GET_ASSETS: `
    query GetAssets($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
      assets(pagination: $pagination, sort: $sort, filter: $filter) {
        assetID
        uniqRef
        slug
        title
        authorID
        organizationID
        mediaID
        description
        price
        legalVatPercent
        quantity
        stockQuantity
        maxPerReservation
        conflictingAssets
        applyableAssets
        state
        createdAt
        updatedAt
        deletedAt
        medias {
          assetMediaID
          listingPosition
          legend
          state
          media {
            url
          }
        }
      }
    }
  `,

  // Récupère un asset via son slug
  GET_ASSET_BY_SLUG: `
    query GetAssetBySlug($slug: String!) {
      assetBySlug(slug: $slug) {
        assetID
        uniqRef
        slug
        title
        authorID
        organizationID
        mediaID
        description
        price
        legalVatPercent
        quantity
        stockQuantity
        maxPerReservation
        conflictingAssets
        applyableAssets
        state
        createdAt
        updatedAt
        deletedAt
        medias {
          assetMediaID
          listingPosition
          legend
          state
          media {
            url
          }
        }
      }
    }
  `,

  // Récupère plusieurs assets via un tableau d'IDs
  GET_ASSETS_BY_IDS: `
    query GetAssetsByIDs($assetIDs: [ID!]!) {
      assetsByIDs(assetIDs: $assetIDs) {
        assetID
        uniqRef
        slug
        title
        authorID
        organizationID
        mediaID
        description
        price
        legalVatPercent
        quantity
        stockQuantity
        maxPerReservation
        conflictingAssets
        applyableAssets
        state
        createdAt
        updatedAt
        deletedAt
        medias {
          assetMediaID
          listingPosition
          legend
          state
          media {
            url
          }
        }
      }
    }
  `,

  // Récupère plusieurs assets via un tableau de slugs
  GET_ASSETS_BY_SLUGS: `
    query GetAssetsBySlugs($slugs: [String!]!) {
      assetsBySlugs(slugs: $slugs) {
        assetID
        uniqRef
        slug
        title
        authorID
        organizationID
        mediaID
        description
        price
        legalVatPercent
        quantity
        stockQuantity
        maxPerReservation
        conflictingAssets
        applyableAssets
        state
        createdAt
        updatedAt
        deletedAt
        medias {
          assetMediaID
          listingPosition
          legend
          state
          media {
            url
          }
        }
      }
    }
  `,

  // Récupère un asset via sa référence unique
  GET_ASSET_BY_UNIQ_REF: `
    query GetAssetByUniqRef($uniqRef: String!) {
      assetByUniqRef(uniqRef: $uniqRef) {
        assetID
        uniqRef
        slug
        title
        authorID
        organizationID
        mediaID
        description
        price
        legalVatPercent
        quantity
        stockQuantity
        maxPerReservation
        conflictingAssets
        applyableAssets
        state
        createdAt
        updatedAt
        deletedAt
        medias {
          assetMediaID
          listingPosition
          legend
          state
          media {
            url
          }
        }
      }
    }
  `,
  // QUERY : Récupère la liste des assets liés à un service
  LIST_ASSETS_BY_SERVICE: `
    query ServiceAsset($input: ListAssetsByServiceInput!) {
      listAssetsByService(input: $input) {
        asset {
          assetID
          title
          description
          organizationID
          assetID
          uniqRef
          slug
          authorID
          mediaID
          price
          legalVatPercent
          quantity
          stockQuantity
          maxPerReservation
          conflictingAssets
          applyableAssets
          state
          createdAt
          medias {
            assetMediaID
            listingPosition
            legend
            state
            media {
              url
            }
          }
        }
        serviceAsset {
          serviceAssetID
          serviceID
          assetID
        }
      }
    }
  `,

  LIST_ASSETS_BY_ORGANIZATION: `
    query ListAssetsByOrganization($input: ListAssetsByOrganizationInput!) {
      listAssetsByOrganization(input: $input) {
        asset {
          assetID
          uniqRef
          slug
          title
          authorID
          organizationID
          mediaID
          description
          price
          legalVatPercent
          quantity
          stockQuantity
          maxPerReservation
          conflictingAssets
          applyableAssets
          state
          createdAt
          updatedAt
          medias {
            assetMediaID
            listingPosition
            legend
            state
            media {
              url
            }
          }
        }
        serviceLinks {
          serviceAsset {
            serviceAssetID
            serviceID
            assetID
          }
          service {
            title
            price
            state
            description
          }
        }
      }
    }
  `,

  LIST_SERVICES_BY_ASSET:`
    query ListServicesByAsset($input: ListServicesByAssetInput!) {
      listServicesByAsset(input: $input) {
        serviceAsset {
          serviceAssetID
          serviceID
          assetID
        }
        service {
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
        }
      }
    }
  `
};

export { assetQueries };
