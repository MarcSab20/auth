// auth/types/graphql.ts - Types pour les appels GraphQL directs

export interface AppLoginInput {
  appID: string;
  appKey: string;
}

export interface AppLoginResponse {
  accessToken: string;
  refreshToken: string;
  accessValidityDuration: number;
  refreshValidityDuration: number;
  application: {
    applicationID: string;
    name?: string;
    description?: string;
    plan?: string;
    isOfficialApp?: boolean;
  };
  message: string;
  errors: string[];
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userKind?: string;
  state?: string;
  plan?: string;
  twoFactorEnabled?: boolean;
  enabled?: boolean;
  emailVerified?: boolean;
}

export interface CreateUserResponse {
  userID: string;
  message: string;
  success: boolean;
  errors: string[];
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
  extensions?: Record<string, any>;
}

// Mutations GraphQL
export const AUTHENTICATE_APP_MUTATION = `
  mutation AuthenticateApp($input: AppLoginInput!) {
    authenticateApp(input: $input) {
      accessToken
      refreshToken
      accessValidityDuration
      refreshValidityDuration
      application {
        applicationID
        name
        description
        plan
        isOfficialApp
      }
      message
      errors
    }
  }
`;

export const REGISTER_USER_MUTATION = `
  mutation registerUser($input: CreateUserInput!) {
    createUser(input: $input) {
      userID
      message
      success
      errors
    }
  }
`;

// Alternative pour signup après invitation à une organisation
export const SIGNUP_AFTER_INVITATION_MUTATION = `
  mutation SignupAfterInvitation($input: CreateUserInput!, $organizationId: String!, $firstName: String, $lastName: String) {
    signupAfterInvitation(input: $input, organizationId: $organizationId, firstName: $firstName, lastName: $lastName) {
      userID
      message
      success
      errors
    }
  }
`;

// Newsletter subscription
export const SUBSCRIBE_NEWSLETTER_MUTATION = `
  mutation SubscribeNewsletter($input: NewsletterSubscriptionInput!) {
    subscribeNewsletter(input: $input) {
      success
      message
      subscriptionId
    }
  }
`;

export interface NewsletterSubscriptionInput {
  email: string;
  userID: string;
  isNewsletterSubscriber: boolean;
  source?: string;
  firstName?: string;
  lastName?: string;
}