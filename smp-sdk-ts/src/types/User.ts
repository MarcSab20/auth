export interface SMPUser {
  userID: string;
  email: string;
  firstName?: string;
  lastName?: string;
  currentOrganizationId?: string;
  profileID?: string;
  roles?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
} 