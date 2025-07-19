// src/types/auth.ts

// Requêtes d'authentification
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
  sessionId?: string;
  user?: User;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
}

export interface SignupResponse {
  success: boolean;
  userId?: string;
  message: string;
  errors?: string[];
  verificationEmailSent?: boolean;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn?: number;
}

// Utilisateur
export interface User {
  organizations?: string[]; 
  accessibleOrganizations: any;
  profileID: string;
  username: string | undefined;
  userID: string;
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  roles: string[];
  organization_ids?: string[];
  state?: string;
  email_verified?: boolean;
  attributes?: UserAttributes;
}

export interface UserAttributes {
  department?: string;
  clearanceLevel?: number;
  jobTitle?: string;
  businessUnit?: string;
  workLocation?: string;
  employmentType?: string;
  [key: string]: any;
}

// États d'authentification
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
}

export interface AuthError {
  message: string;
  code?: string;
  type: 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR';
  field?: string;
}

// Vérification email et reset password
export interface VerifyEmailRequest {
  token: string;
  userId: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  userId: string;
}