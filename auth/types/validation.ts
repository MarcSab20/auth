// src/types/validation.ts

export interface ValidationRequest {
  value: string;
  field: string;
}

export interface BaseValidationResult {
  valid: boolean;
  errors: string[];
  suggestions?: string[];
}

export interface ValidationResponse {
  valid: boolean;
  available?: boolean;
  deliverable?: boolean;
  errors: string[];
  suggestions?: string[];
  score?: number;
}

export interface ValidationState {
  isValid: boolean;
  isValidating: boolean;
  errors: string[];
  suggestions: string[];
  lastValidated?: string;
  score?: number;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenPatterns: string[];
}

export interface PasswordValidationResult extends BaseValidationResult{
  score: number;
}

export interface UsernameValidationResult extends BaseValidationResult {
  available: boolean;
}

export interface EmailValidationResult extends BaseValidationResult {
  available: boolean;
  deliverable: boolean;
}

export interface UsernameSuggestion {
  username: string;
  available: boolean;
  score: number;
}

export interface ValidationSummary {
  username: ValidationState;
  email: ValidationState;
  password: ValidationState;
  overall: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface RegistrationStatus {
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  defaultRoles: string[];
}

export interface ValidationError extends Error {
  field: string;
  code: string;
  suggestions?: string[];
}

export type ValidationResult = PasswordValidationResult | UsernameValidationResult | EmailValidationResult;