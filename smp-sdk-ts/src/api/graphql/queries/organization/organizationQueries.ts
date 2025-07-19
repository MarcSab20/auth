// smp-sdk-ts/src/api/graphql/queries/organizationQueries.js


const organizationQueries = {
  // QUERY TO GET A LIST OF ORGANIZATIONS
  GET_ORGANIZATIONS: `
    query GetOrganizations {
      organizations {
        organizationID
        uniqRef
        slug
        authorID
        ownerID
        orgRef
        sectorID
        legalName
        brand
        sigle
        smallLogo
        bigLogo
        banner
        smallLogoUrl
        bigLogoUrl
        bannerUrl
        oSize
        juridicForm
        juridicCatLabel
        juridicCatCode
        currency
        legalUniqIdentifier
        vatNumber
        communityVATNumber
        capital
        insuranceRef
        insuranceName
        activityStartedAt
        activityEndedAt
        description
        summary
        locationID
        parentOrganizationID
        advancedAttributes
        state
        createdAt
        updatedAt
      }
    }
  `,

  // QUERY TO GET A SINGLE ORGANIZATION BY ID
  GET_ORGANIZATION_BY_ID: `
    query GetOrganization($organizationID: ID!) {
      organization(organizationID: $organizationID) {
        organizationID
        uniqRef
        slug
        authorID
        ownerID
        orgRef
        sectorID
        legalName
        brand
        sigle
        smallLogo
        bigLogo
        banner
        smallLogoUrl
        bigLogoUrl
        bannerUrl
        oSize
        juridicForm
        juridicCatLabel
        juridicCatCode
        currency
        legalUniqIdentifier
        vatNumber
        communityVATNumber
        capital
        insuranceRef
        insuranceName
        activityStartedAt
        activityEndedAt
        description
        summary
        locationID
        parentOrganizationID
        advancedAttributes
        state
        createdAt
        updatedAt
      }
    }
  `,

  // QUERY TO GET ORGANIZATIONS BY MULTIPLE IDS
  GET_ORGANIZATIONS_BY_IDS: `
    query GetOrganizationsByIDs($organizationIDs: [ID!]!) {
      organizationsByIDs(organizationIDs: $organizationIDs) {
        organizationID
        uniqRef
        slug
        authorID
        ownerID
        orgRef
        sectorID
        legalName
        brand
        sigle
        smallLogo
        bigLogo
        banner
        smallLogoUrl
        bigLogoUrl
        bannerUrl
        oSize
        juridicForm
        juridicCatLabel
        juridicCatCode
        currency
        legalUniqIdentifier
        vatNumber
        communityVATNumber
        capital
        insuranceRef
        insuranceName
        activityStartedAt
        activityEndedAt
        description
        summary
        locationID
        parentOrganizationID
        advancedAttributes
        state
        createdAt
        updatedAt
      }
    }
  `,

  // QUERY TO GET AN ORGANIZATION BY ITS UNIQUE REFERENCE
  GET_ORGANIZATION_BY_UNIQ_REF: `
    query GetOrganizationByUniqRef($uniqRef: String!) {
      organizationByUniqRef(uniqRef: $uniqRef) {
        organizationID
        uniqRef
        slug
        authorID
        ownerID
        orgRef
        sectorID
        legalName
        brand
        sigle
        smallLogo
        bigLogo
        banner
        smallLogoUrl
        bigLogoUrl
        bannerUrl
        oSize
        juridicForm
        juridicCatLabel
        juridicCatCode
        currency
        legalUniqIdentifier
        vatNumber
        communityVATNumber
        capital
        insuranceRef
        insuranceName
        activityStartedAt
        activityEndedAt
        description
        summary
        locationID
        parentOrganizationID
        advancedAttributes
        state
        createdAt
        updatedAt
      }
    }
  `,

  // QUERY TO GET AN ORGANIZATION BY ITS SLUG
  GET_ORGANIZATION_BY_SLUG: `
    query GetOrganizationBySlug($slug: String!) {
      organizationBySlug(slug: $slug) {
        organizationID
        uniqRef
        slug
        authorID
        ownerID
        orgRef
        sectorID
        legalName
        brand
        sigle
        smallLogo
        bigLogo
        banner
        smallLogoUrl
        bigLogoUrl
        bannerUrl
        oSize
        juridicForm
        juridicCatLabel
        juridicCatCode
        currency
        legalUniqIdentifier
        vatNumber
        communityVATNumber
        capital
        insuranceRef
        insuranceName
        activityStartedAt
        activityEndedAt
        description
        summary
        locationID
        parentOrganizationID
        advancedAttributes
        state
        createdAt
        updatedAt
      }
    }
  `,

  // QUERY TO GET MULTIPLE ORGANIZATIONS BY SLUGS
  GET_ORGANIZATIONS_BY_SLUGS: `
    query GetOrganizationsBySlugs($slugs: [String!]!) {
      organizationsBySlugs(slugs: $slugs) {
        organizationID
        uniqRef
        slug
        authorID
        ownerID
        orgRef
        sectorID
        legalName
        brand
        sigle
        smallLogo
        bigLogo
        banner
        smallLogoUrl
        bigLogoUrl
        bannerUrl
        oSize
        juridicForm
        juridicCatLabel
        juridicCatCode
        currency
        legalUniqIdentifier
        vatNumber
        communityVATNumber
        capital
        insuranceRef
        insuranceName
        activityStartedAt
        activityEndedAt
        description
        summary
        locationID
        parentOrganizationID
        advancedAttributes
        state
        createdAt
        updatedAt
      }
    }
  `,

   // QUERY TO GET A LIST OF ORGANIZATION MEMBERS
  GET_ORGANIZATION_MEMBERS: `
    query ListOrganizationMembers($organizationId: ID!) {
      listOrganizationMembers(organizationID: $organizationId) {
        members {
          userID
          role
          username
          email
          name
          lastname
          joinedAt
          profilePicture
        }
        totalMembers
      }
    }
  `,

  // QUERY TO GET A LIST OF ORGANIZATION MEMBERS
  GET_USER_ORGANIZATIONS:`
    query GetUserOrganizations($userId: ID!) {
      getUserOrganizations(userID: $userId) {
        organizationID
        organizationName
        smallLogoUrl
        userRole {
          roleID
          roleName
        }
      }
    }
  `
};

export { organizationQueries };
