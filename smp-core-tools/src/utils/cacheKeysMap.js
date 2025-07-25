
function keyFor(initialKey) {
  const cacheKeyGenFn = (appId = 1, entityID = undefined, userID = undefined) => {
    if (undefined === userID || (entityID !== undefined && entityID == userID)) {
      return `app:${appId}:${initialKey}:${entityID}` ;
    } else if (undefined === userID && entityID == undefined) {
      return `app:${appId}:u:${userID}:${initialKey}` ;
    } else if (undefined === userID && entityID == undefined) {
      return `app:${appId}:u:${userID}:${initialKey}` ;
    } else {
      return `app:${appId}:u:${userID}:${initialKey}:${entityID}` ;
    }
  }; 
  return cacheKeyGenFn;
}

export const cacheKey = {
  analytic: keyFor('ana'),
  application: keyFor('app'),
  applicationToken: keyFor('appt'),
  asset: keyFor('a'),
  audit: keyFor('audit'),
  authN: keyFor('authn'),
  authZ: keyFor('authz'),
  comment: keyFor('c'),
  contract: keyFor('contract'),
  criteria: keyFor('criteria'),
  estimate: keyFor('e'),
  estimateAsset: keyFor('e:asset'),
  faqAnswer: keyFor('faq:answer'),
  faqOrganization: keyFor('faq:org'),
  faqQuestion: keyFor('faq:question'),
  faqService: keyFor('faq:s'),
  industry: keyFor('industry'),
  invoice: keyFor('i'),
  joint: keyFor('joint'),
  media: keyFor('media'),
  member: keyFor('member'),
  message: keyFor('msg'),
  notification: keyFor('n'),
  notificationTemplate: keyFor('n:template'),
  organization: keyFor('org'),
  organizationMedia: keyFor('org:media'),
  paymentConfig: keyFor('pc'),
  paymentMethod: keyFor('pm'),
  place: keyFor('place'),
  profile: keyFor('profile'),
  receipt: keyFor('r'),
  recommender: keyFor('rec'),
  resetPasswordToken: keyFor('rpwsd'),
  review: keyFor('review'),
  reviewComment: keyFor('rc'),
  reversal: keyFor('rev'),
  role: keyFor('role'),
  service: keyFor('s'),
  serviceAsset: keyFor('s:a'),
  serviceAttribute: keyFor('s:attr'),
  serviceMedia: keyFor('s:media'),
  tag: keyFor('tag'),
  tagOrganization: keyFor('tag:org'),
  template: keyFor('template'),
  termsAndConditions: keyFor('tac'),
  topic: keyFor('topic'),
  topicOrganization: keyFor('topic:org'),
  transaction: keyFor('t'),
  user: keyFor('u'),
  userOrganization: keyFor('uorg'),
  userPreference: keyFor('preference'),
  userToken: keyFor('ut')
};


Object.freeze(cacheKey);

