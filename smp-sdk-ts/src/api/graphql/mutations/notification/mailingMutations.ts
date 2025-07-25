// src/api/graphql/mutations/mailing/mailingMutations.js

const mailingMutations = {
    // ------------------ Campaign ------------------
    CREATE_CAMPAIGN: `
      mutation CreateCampaign($input: CreateCampaignInput!) {
        createCampaign(input: $input) {
          campaignID
        }
      }
    `,
    UPDATE_CAMPAIGN: `
      mutation UpdateCampaign($campaignID: ID!, $input: UpdateCampaignInput!) {
        updateCampaign(campaignID: $campaignID, input: $input) {
          campaignID
        }
      }
    `,
    DELETE_CAMPAIGN: `
      mutation DeleteCampaign($campaignID: ID!) {
        deleteCampaign(campaignID: $campaignID)
      }
    `,
  
    // ------------------ Newsletter ------------------
    CREATE_NEWSLETTER: `
      mutation CreateNewsletter($input: CreateNewsletterInput!) {
        createNewsletter(input: $input) {
          newsletterID
        }
      }
    `,
    UPDATE_NEWSLETTER: `
      mutation UpdateNewsletter($newsletterID: ID!, $input: UpdateNewsletterInput!) {
        updateNewsletter(newsletterID: $newsletterID, input: $input) {
          newsletterID
        }
      }
    `,
    DELETE_NEWSLETTER: `
      mutation DeleteNewsletter($newsletterID: ID!) {
        deleteNewsletter(newsletterID: $newsletterID)
      }
    `,
  
    // ------------------ NewsletterContact ------------------
    CREATE_NEWSLETTER_CONTACT: `
      mutation CreateNewsletterContact($input: CreateNewsletterContactInput!) {
        createNewsletterContact(input: $input) {
          newsletterContactID
        }
      }
    `,
    UPDATE_NEWSLETTER_CONTACT: `
      mutation UpdateNewsletterContact($newsletterContactID: ID!, $input: UpdateNewsletterContactInput!) {
        updateNewsletterContact(newsletterContactID: $newsletterContactID, input: $input) {
          newsletterContactID
        }
      }
    `,
    DELETE_NEWSLETTER_CONTACT: `
      mutation DeleteNewsletterContact($newsletterContactID: ID!) {
        deleteNewsletterContact(newsletterContactID: $newsletterContactID)
      }
    `,
  };
  
  export { mailingMutations };
  