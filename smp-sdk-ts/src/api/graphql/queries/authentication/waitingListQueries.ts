export const waitingListQueries = {
  GET_WAITING_LIST: `
    query GetWaitingList($waitingListID: ID!) {
      waitingList(waitingListID: $waitingListID) {
        waitingListID
        uniqRef
        firstName
        lastName
        email
        city
        details
        age
        jwt
        mailSent
        lastMailSentAt
        state
        slug
        createdAt
        updatedAt
      }
    }
  `,

  GET_WAITING_LISTS: `
    query GetWaitingLists($page: Int, $limit: Int, $state: WaitingListState) {
      waitingLists(page: $page, limit: $limit, state: $state) {
        waitingListID
        uniqRef
        firstName
        lastName
        email
        city
        details
        age
        jwt
        mailSent
        lastMailSentAt
        state
        slug
        createdAt
        updatedAt
      }
    }
  `
}; 