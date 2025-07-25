export const organizationMutations = {
  // MUTATION TO CREATE AN ORGANIZATION
  CREATE_ORGANIZATION: `
    mutation CreateOrganization($input: OrganizationInput!) {
      createOrganization(input: $input) {
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

  // MUTATION TO UPDATE AN ORGANIZATION
  UPDATE_ORGANIZATION: `
    mutation UpdateOrganization($organizationID: ID!, $input: OrganizationInput!) {
      updateOrganization(organizationID: $organizationID, input: $input) {
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

  // MUTATION TO DELETE AN ORGANIZATION
  DELETE_ORGANIZATION: `
    mutation DeleteOrganization($organizationID: ID!) {
      deleteOrganization(organizationID: $organizationID) {
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
        deletedAt
      }
    }
  `,

  // MUTATION TO VERIFY AN INVITATION TOKEN
  VERIFY_INVITATION_TOKEN: `
    mutation VerifyInvitationToken($input: VerifyInvitationTokenInput!) {
      verifyInvitationToken(input: $input) {
        success
        message
        email
        organizationID
        userExists
        userID
        firstName
        lastName
      }
    }
  `,

  // MUTATION TO INVITE A USER TO AN ORGANIZATION
  INVITE_USER_TO_ORGANIZATION: `
    mutation InviteUserToOrganization($input: InviteUserToOrganizationInput!) {
      inviteUserToOrganization(input: $input) {
        success
        message
      }
    }
  `,

  // MUTATION TO CREATE A USER ORGANIZATION
  CREATE_USER_ORGANIZATION: `
    mutation CreateUserOrganization($input: AddUserToOrganizationInput!) {
      addUserToOrganization(input: $input) {
        success
        message
      }
    }
  `,

  // MUTATION TO UPDATE A USER ORGANIZATION
  UPDATE_USER_ROLE_IN_ORGANIZATION: `
    mutation UpdateUserRoleInOrganization($input: UpdateUserRoleInOrganizationInput!) {
      updateUserRoleInOrganization(input: $input) {
        success
        message
      }
    }
  `,

  // MUTATION TO REMOVE A USER FROM AN ORGANIZATION
  REMOVE_USER_FROM_ORGANIZATION: `
    mutation RemoveUserFromOrganization($input: RemoveUserFromOrganizationInput!) {
      removeUserFromOrganization(input: $input) {
        success
        message
      }
    }
  `,

  // MUTATION TO REMOVE AN INVITATION
  REMOVE_INVITATION: `
    mutation RemoveInvitation($input: RemoveInvitationInput!) {
      removeInvitation(input: $input) {
        success
        message
      }
    }
  `,

  // MUTATION TO ADD USER TO ORGANIZATION
  ADD_USER_TO_ORGANIZATION: `
    mutation AddUserToOrganization($input: AddUserToOrganizationInput!) {
      addUserToOrganization(input: $input) {
        success
        message
      }
    }
  `
};
