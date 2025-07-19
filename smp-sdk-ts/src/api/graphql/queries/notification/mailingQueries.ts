// src/api/graphql/queries/mailing/mailingQueries.js

const mailingQueries = {
    // ------------------ Campaign ------------------
    GET_CAMPAIGN_BY_ID: `
      query GetCampaignById($campaignID: ID!) {
        campaign(campaignID: $campaignID) {
          campaignID
          uniqRef
          slug
          emailCampaignTemplateID
          subject
          contentHTML
          contentText
          groupIDs
          scheduledAt
          sentAt
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
    GET_CAMPAIGNS: `
      query GetCampaigns($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
        campaigns(pagination: $pagination, sort: $sort, filter: $filter) {
          campaignID
          uniqRef
          slug
          emailCampaignTemplateID
          subject
        }
      }
    `,
    GET_CAMPAIGN_BY_SLUG: `
      query GetCampaignBySlug($slug: String!) {
        campaignBySlug(slug: $slug) {
          campaignID
          uniqRef
          slug
          emailCampaignTemplateID
          subject
        }
      }
    `,
  
    // ------------------ Newsletter ------------------
    GET_NEWSLETTER: `
      query GetNewsletter($newsletterID: ID!) {
        newsletter(newsletterID: $newsletterID) {
          newsletterID
          uniqRef
          slug
          emailNewsletterTemplateID
          subject
          contentHTML
          contentText
          scheduledAt
          sentAt
          state
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
    GET_NEWSLETTERS: `
      query GetNewsletters($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
        newsletters(pagination: $pagination, sort: $sort, filter: $filter) {
          newsletterID
          uniqRef
          slug
          emailNewsletterTemplateID
          subject
        }
      }
    `,
    GET_NEWSLETTER_BY_SLUG: `
      query GetNewsletterBySlug($slug: String!) {
        newsletterBySlug(slug: $slug) {
          newsletterID
          uniqRef
          slug
          emailNewsletterTemplateID
          subject
        }
      }
    `,
  
    // ------------------ NewsletterContact ------------------
    GET_NEWSLETTER_CONTACT: `
      query GetNewsletterContact($newsletterContactID: ID!) {
        newsletterContact(newsletterContactID: $newsletterContactID) {
          newsletterContactID
          userID
          email
          firstName
          lastName
          isNewsletterSubscriber
          source
          country
          gender
          birthDate
          state
          slug
          uniqRef
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
    GET_NEWSLETTER_CONTACTS: `
      query GetNewsletterContacts($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
        newsletterContacts(pagination: $pagination, sort: $sort, filter: $filter) {
          newsletterContactID
          userID
          email
          firstName
          lastName
        }
      }
    `,
    GET_NEWSLETTER_CONTACT_BY_SLUG: `
      query GetNewsletterContactBySlug($slug: String!) {
        newsletterContactBySlug(slug: $slug) {
          newsletterContactID
          userID
          email
          firstName
          lastName
        }
      }
    `,
    GET_NEWSLETTER_CONTACTS_BY_USER_ID: `
      query GetNewsletterContactsByUserID($userID: ID!) {
        newsletterContactsByUserID(userID: $userID) {
          newsletterContactID
          email
          firstName
          lastName
        }
      }
    `,
  };
  
  export { mailingQueries };
  