/**
 * Valid action types for CRUD operations.
 * @constant {Object}
 */
const ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  VISITED: 'visited',
  LISTED: 'listed',
};

Object.freeze(ACTIONS);

function generateCrudOperations(entityName, customEvents = {}) {
  const normalized = entityName.toLowerCase();
  const defaultEvents = {
    created: `rk.${normalized}.${ACTIONS.CREATED}`,
    updated: `rk.${normalized}.${ACTIONS.UPDATED}`,
    deleted: `rk.${normalized}.${ACTIONS.DELETED}`,
    visited: `rk.${normalized}.${ACTIONS.VISITED}`,
    listed: `rk.${normalized}.${ACTIONS.LISTED}`,
  };

  const events = { ...defaultEvents, ...customEvents };

  if ('stars' in customEvents) {
    let starVal = customEvents.stars;
    starVal = starVal.toLowerCase();
    if (!starVal.startsWith('rk.')) {
      starVal = `rk.${starVal}`;
    }
    events.stars = starVal;
  } else {
    events.stars = `rk.${normalized}.*`;
  }

  return events;
}

/**
 * Configuration des événements pour chaque entité des différents microservices.
 */
const SMPEvents = {
  UserSpace: {
    stars: 'userspace.*',
    User: generateCrudOperations('UserSpace.User', { deactivated: 'rk.userspace.user.deactivated' }),
    UserRole: generateCrudOperations('UserSpace.UserRole', { dismissed: 'rk.userspace.userrole.dismissed' }),
    Profile: generateCrudOperations('UserSpace.Profile'),
    PaymentMethod: generateCrudOperations('UserSpace.PaymentMethod'),
    PaymentConfig: generateCrudOperations('UserSpace.PaymentConfig'),
    Role: generateCrudOperations('UserSpace.Role'),
    UserPreference: generateCrudOperations('UserSpace.UserPreference'),
  },

  Organization: {
    stars: 'organization.*',
    Organization: generateCrudOperations('Organization.Organization'),
    UserOrganization: generateCrudOperations('Organization.UserOrganization'),
    TermsAndConditions: generateCrudOperations('Organization.TermsAndConditions'),
    FaqOrganization: generateCrudOperations('Organization.FaqOrganization'),
    OrganizationMedia: generateCrudOperations('Organization.OrganizationMedia'),
    Industry: generateCrudOperations('Organization.Industry'),
    TagOrganization: generateCrudOperations('Organization.TagOrganization'),
    TopicOrganization: generateCrudOperations('Organization.TopicOrganization'),
    JointOrganizationInvitation: { sent: 'rk.organization.jointorganizationinvitation.sent' },
    MemberOrganization: {
      stars: "rk.organization.memberorganization.*", // Définit explicitement le wildcard pour MemberOrganization
      invited: 'rk.organization.memberorganization.invited',
      removed: 'rk.organization.memberorganization.removed',
      updated: 'rk.organization.memberorganization.updated'
    },
  },

  Catalog: {
    stars: 'catalog.*',
    Service: generateCrudOperations('Catalog.Service', { 
      addedToFavorite: 'rk.catalog.service.addedtofavorite',
      removedFromFavorite: 'rk.catalog.service.removedfromfavorite'
    }),
    Criteria: generateCrudOperations('Catalog.Criteria'),
    Asset: generateCrudOperations('Catalog.Asset'),
    ServiceAsset: generateCrudOperations('Catalog.ServiceAsset'),
    ServiceMedia: generateCrudOperations('Catalog.ServiceMedia'),
    FaqAnswer: generateCrudOperations('Catalog.FaqAnswer'),
    FaqQuestion: generateCrudOperations('Catalog.FaqQuestion'),
    FaqService: generateCrudOperations('Catalog.FaqService'),
    ServiceAttribute: generateCrudOperations('Catalog.ServiceAttribute'),
    Topic: generateCrudOperations('Catalog.Topic'),
    Tag: generateCrudOperations('Catalog.Tag'),
    AssetMedia: generateCrudOperations('Catalog.AssetMedia'),
  },

  Accounting: {
    stars: 'accounting.*',
    Invoice: generateCrudOperations('Accounting.Invoice', { 
      paid: 'rk.accounting.invoice.paid' 
    }, { 
      paymentFailed: 'rk.accounting.invoice.paymentfailed' 
    }),
    Estimate: generateCrudOperations('Accounting.Estimate'),
    Transaction: generateCrudOperations('Accounting.Transaction'),
    EstimateAsset: generateCrudOperations('Accounting.EstimateAsset'),
    InvoicePaymentIntent: { created: 'rk.accounting.invoicepaymentintent.created' },
  },

  Notification: {
    stars: 'notification.*',
    Notification: generateCrudOperations('Notification.Notification', { 
      read: 'rk.notification.notification.read' 
    }),
    NotificationTemplate: generateCrudOperations('Notification.NotificationTemplate'),
    NotiUser: { created: 'rk.notification.notiuser.created' },
    NotiCommit: { created: 'rk.notification.noticommit.created' },
    NewsletterContact: generateCrudOperations('Notification.NewsletterContact'),
    ContactGroup: generateCrudOperations('Notification.ContactGroup'),
    ContactGroupMembership: generateCrudOperations('Notification.ContactGroupMembership'),
    Campaign: generateCrudOperations('Notification.Campaign', { 
      readyToCommit: 'rk.notification.campaign.readytocommit' 
    }),
    Newsletter: generateCrudOperations('Notification.Newsletter', { 
      readyToCommit: 'rk.notification.newsletter.readytocommit' 
    }),
  },

  ReviewComment: {
    stars: 'reviewcomment.*',
    Criteria: generateCrudOperations('ReviewComment.Criteria'),
    Comment: generateCrudOperations('ReviewComment.Comment'),
    Review: generateCrudOperations('ReviewComment.Review'),
  },

  Authentication: {
    stars: 'authentication.*',
    Application: generateCrudOperations('Authentication.Application', { 
      logged: 'rk.authentication.application.logged', 
      register: 'rk.authentication.application.register', 
      desactivated: 'rk.authentication.application.desactivated', 
      logout: 'rk.authentication.application.logout' 
    }),
    ApplicationToken: generateCrudOperations('Authentication.ApplicationToken', { 
      refreshed: 'rk.authentication.applicationtoken.refreshed' 
    }),
    UserToken: generateCrudOperations('Authentication.UserToken', { 
      refreshed: 'rk.authentication.usertoken.refreshed' 
    }),
    User: generateCrudOperations('Authentication.User', { 
      deactivated: 'rk.authentication.user.deactivated', 
      logged: 'rk.authentication.user.logged', 
      signup: 'rk.authentication.user.signup', 
      logout: 'rk.authentication.user.logout' 
    }),
    AuthZ: { 
      allowed: 'rk.authz.allowed', 
      denied: 'rk.authz.denied', 
      removed: 'rk.authz.removed', 
      added: 'rk.authz.added' 
    },
    ResetPasswordToken: generateCrudOperations('Authentication.ResetPasswordToken'),
    Password: generateCrudOperations('Authentication.Password'),
    UserInvited: { 
      stars: "rk.authentication.userinvited.*", 
      created: 'rk.authentication.userinvited.created', 
      canceled: 'rk.authentication.userinvited.canceled', 
      expired: 'rk.authentication.userinvited.expired'
    },
    WaitingList: {
      stars: "rk.authentication.waitinglist.*",
      created: 'rk.authentication.waitinglist.created',
      updated: 'rk.authentication.waitinglist.updated',
      deleted: 'rk.authentication.waitinglist.deleted',
      confirmed: 'rk.authentication.waitinglist.confirmed',
      emailResent: 'rk.authentication.waitinglist.emailresent',
    },
  },

  Authorization: {
    stars: 'authorization.*',
    Role: generateCrudOperations('Authorization.Role', { 
      deactivated: 'rk.authorization.role.revoked' 
    }),
    Member: { 
      logged: 'rk.authorization.member.allowed', 
      refreshed: 'rk.authorization.member.denied', 
      logout: 'rk.authorization.member.removed', 
      added: 'rk.authorization.member.added' 
    },
  },

  Document: {
    stars: 'document.*',
    Media: generateCrudOperations('Document.Media'),
    MediaFolder: generateCrudOperations('Document.MediaFolder'),
    EstimateMedia: generateCrudOperations('Document.EstimateMedia'),
    AssetMedia: generateCrudOperations('Document.AssetMedia'),
    InvoiceMedia: generateCrudOperations('Document.InvoiceMedia'),
    TransactionMedia: generateCrudOperations('Document.TransactionMedia'),
    UserMedia: generateCrudOperations('Document.UserMedia'),
    OrganizationMedia: generateCrudOperations('Document.OrganizationMedia'),
    ServiceMedia: generateCrudOperations('Document.ServiceMedia'),
    FaqAnswer: generateCrudOperations('Document.FaqAnswerMedia'),
    FaqQuestion: generateCrudOperations('Document.FaqQuestionMedia'),
  },

  Location: {
    stars: 'location.*',
    Place: generateCrudOperations('Location.Place'),
  },
};

Object.freeze(SMPEvents);

export { SMPEvents, ACTIONS };
