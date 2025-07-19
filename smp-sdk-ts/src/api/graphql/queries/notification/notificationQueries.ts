// smp-sdk-ts/src/api/graphql/queries/notification/notificationQueries.js

const notificationQueries = {
    // QUERY TO GET A LIST OF NOTIFICATIONS WITH OPTIONAL PAGINATION, SORTING, AND FILTERING
    GET_NOTIFICATIONS: `
      query GetNotifications($pagination: PaginationInput, $sort: SortInput, $filter: [FilterInput!]) {
        notifications(pagination: $pagination, sort: $sort, filter: $filter) {
          notificationID
          userID
          title
          message
          readAt
          link
          state
          slug
          uniqRef
          type
          notificationTemplateID
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET A SINGLE NOTIFICATION BY ITS UNIQUE ID
    GET_NOTIFICATION_BY_ID: `
      query GetNotificationByID($notificationID: ID!) {
        notificationByID(notificationID: $notificationID) {
          notificationID
          userID
          title
          message
          readAt
          link
          state
          slug
          uniqRef
          type
          notificationTemplateID
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET MULTIPLE NOTIFICATIONS BY AN ARRAY OF NOTIFICATION IDS
    GET_NOTIFICATIONS_BY_IDS: `
      query GetNotificationsByIDs($notificationIDs: [ID!]!) {
        notificationsByIDs(notificationIDs: $notificationIDs) {
          notificationID
          userID
          title
          message
          readAt
          link
          state
          slug
          uniqRef
          type
          notificationTemplateID
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET A NOTIFICATION BY ITS UNIQUE REFERENCE
    GET_NOTIFICATION_BY_UNIQ_REF: `
      query GetNotificationByUniqRef($uniqRef: String!) {
        notificationByUniqRef(uniqRef: $uniqRef) {
          notificationID
          userID
          title
          message
          readAt
          link
          state
          slug
          uniqRef
          type
          notificationTemplateID
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET A NOTIFICATION BY ITS SLUG
    GET_NOTIFICATION_BY_SLUG: `
      query GetNotificationBySlug($slug: String!) {
        notificationBySlug(slug: $slug) {
          notificationID
          userID
          title
          message
          readAt
          link
          state
          slug
          uniqRef
          type
          notificationTemplateID
          createdAt
          updatedAt
          deletedAt
        }
      }
    `,
  
    // QUERY TO GET MULTIPLE NOTIFICATIONS BY SLUGS
    GET_NOTIFICATIONS_BY_SLUGS: `
      query GetNotificationsBySlugs($slugs: [String!]!) {
        notificationsBySlugs(slugs: $slugs) {
          notificationID
          userID
          title
          message
          readAt
          link
          state
          slug
          uniqRef
          type
          notificationTemplateID
          createdAt
          updatedAt
          deletedAt
        }
      }
    `
  };
  
  export { notificationQueries };
  