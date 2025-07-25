export const profileQueries = {
    // Query to get a single profile by ID
    GET_PROFILE: `
      query Profile($profileId: ID!) {
        profile(profileID: $profileId) {
          profileID
          uniqRef
          slug
          firstName
          lastName
          dateOfBirth
          gender
          nationality
          phoneNumber
          locationID
          idCardNumber
          passportNumber
          socialSecurityNumber
          state
          createdAt
          updatedAt
          deletedAt
          profilePictureID
          profilePicture {
            url
          }
        }
      }
    `,
    
    // Query to get all profiles
    GET_PROFILES: `
      query Profiles {
        profiles {
          profileID
          uniqRef
          slug
          firstName
          lastName
          dateOfBirth
          gender
          nationality
          phoneNumber
          locationID
          idCardNumber
          passportNumber
          socialSecurityNumber
          state
          createdAt
          updatedAt
          deletedAt
          profilePictureID
          profilePicture {
            url
          }
        }
      }
    `,

    // Query to get a profile by slug
    GET_PROFILE_BY_SLUG: `
      query ProfileBySlug($slug: String!) {
        profileBySlug(Slug: $slug) {
          profileID
          uniqRef
          slug
          firstName
          lastName
          dateOfBirth
          gender
          nationality
          phoneNumber
          locationID
          idCardNumber
          passportNumber
          socialSecurityNumber
          state
          createdAt
          updatedAt
          deletedAt
          profilePictureID
          profilePicture {
            url
          }
        }
      }
    `,

    // Query to get a profile by uniqRef
    GET_PROFILE_BY_UNIQ_REF: `
      query ProfileByUniqRef($uniqRef: String!) {
        profileByUniqRef(uniqRef: $uniqRef) {
          profileID
          uniqRef
          slug
          firstName
          lastName
          dateOfBirth
          gender
          nationality
          phoneNumber
          locationID
          idCardNumber
          passportNumber
          socialSecurityNumber
          state
          createdAt
          updatedAt
          deletedAt
          profilePictureID
          profilePicture {
            url
          }
        }
      }
    `,

    // Query to get profiles by IDs
    GET_PROFILES_BY_IDS: `
      query ProfilesByIds($profileIDs: [ID!]!) {
        profilesByIDs(profileIDs: $profileIDs) {
          profileID
          uniqRef
          slug
          firstName
          lastName
          dateOfBirth
          gender
          nationality
          phoneNumber
          locationID
          idCardNumber
          passportNumber
          socialSecurityNumber
          state
          createdAt
          updatedAt
          deletedAt
          profilePictureID
          profilePicture {
            url
          }
        }
      }
    `,

    // Query to get profiles by slugs
    GET_PROFILES_BY_SLUGS: `
      query ProfilesBySlugs($slugs: [String!]!) {
        profilesBySlugs(slugs: $slugs) {
          profileID
          uniqRef
          slug
          firstName
          lastName
          dateOfBirth
          gender
          nationality
          phoneNumber
          locationID
          idCardNumber
          passportNumber
          socialSecurityNumber
          state
          createdAt
          updatedAt
          deletedAt
          profilePictureID
          profilePicture {
            url
          }
        }
      }
    `,
  };
  