export interface SignupInvitationFormData {
  name: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface PasswordCriteria {
  length: boolean;
  specialChar: boolean;
  uppercase: boolean;
  number: boolean;
}

export interface UsernameCriteria {
  length: boolean;
  noSpaces: boolean;
  lowercase: boolean;
}

export interface TokenData {
  waitingListID: string;
  firstName?: string;
  lastName: string;
  email: string;
  age: number;
  isUserExists: boolean;
  userState?: string;
  waitingListState?: string;
} 