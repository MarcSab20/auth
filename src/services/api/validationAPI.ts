import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/types/api';
import {
  ValidationResponse,
  PasswordPolicy,
  PasswordValidationResult,
  UsernameValidationResult,
  EmailValidationResult,
  RegistrationStatus,
  ValidationSummary,
} from '@/types/validation';
import { SignupRequest } from '@/types/auth';

class ValidationAPI {
  private validationCache = new Map<string, { result: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 secondes

  async validateUsername(username: string): Promise<{
    valid: boolean;
    available: boolean;
    errors: string[];
    suggestions: string[];
  }> {
    const cacheKey = `username:${username}`;
    const cached = this.getCachedResult(cacheKey);
    
    if (cached) {
      return cached;
    }

    const errors: string[] = [];
    const suggestions: string[] = [];

    if (username.length < 4) {
      errors.push('Le nom d\'utilisateur doit contenir au moins 4 caractères');
    }

    if (/\s/.test(username)) {
      errors.push('Le nom d\'utilisateur ne doit pas contenir d\'espaces');
    }

    if (username !== username.toLowerCase()) {
      errors.push('Le nom d\'utilisateur doit être en minuscules');
    }

    const bannedUsernames = ['admin', 'root', 'test', 'null', 'undefined'];
    if (bannedUsernames.includes(username.toLowerCase())) {
      errors.push('Ce nom d\'utilisateur est réservé');
      suggestions.push(`${username}123`, `${username}_user`, `my_${username}`);
    }

    const result = {
      valid: errors.length === 0,
      available: errors.length === 0, 
      errors,
      suggestions
    };

    this.setCacheResult(cacheKey, result);
    return result;
  }

  async validateEmail(email: string): Promise<{
    valid: boolean;
    available: boolean;
    deliverable: boolean;
    errors: string[];
  }> {
    const cacheKey = `email:${email}`;
    const cached = this.getCachedResult(cacheKey);
    
    if (cached) {
      return cached;
    }

    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errors.push('Format d\'email invalide');
    }

    const result = {
      valid: errors.length === 0,
      available: errors.length === 0, 
      deliverable: errors.length === 0,
      errors
    };

    this.setCacheResult(cacheKey, result);
    return result;
  }

  async validatePassword(password: string): Promise<{
    valid: boolean;
    errors: string[];
    score: number;
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    if (password.length < 12) {
      errors.push('Le mot de passe doit contenir au moins 12 caractères');
    } else {
      score += 25;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
      suggestions.push('Ajoutez une lettre majuscule');
    } else {
      score += 25;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
      suggestions.push('Ajoutez un caractère spécial (!@#$%...)');
    } else {
      score += 25;
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
      suggestions.push('Ajoutez un chiffre');
    } else {
      score += 25;
    }

    return {
      valid: errors.length === 0,
      errors,
      score,
      suggestions
    };
  }

  async generateUsernameSuggestions(
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<string[]> {
    const suggestions: string[] = [];
    const baseUsername = email.split('@')[0].toLowerCase();
    
    suggestions.push(baseUsername);
    
    if (firstName) {
      suggestions.push(firstName.toLowerCase());
      if (lastName) {
        suggestions.push(`${firstName.toLowerCase()}_${lastName.toLowerCase()}`);
        suggestions.push(`${firstName.toLowerCase()}${lastName.toLowerCase()}`);
      }
    }
    
    suggestions.push(`${baseUsername}123`);
    suggestions.push(`${baseUsername}_user`);
    
    return suggestions.slice(0, 5); 
  }

  async getPasswordPolicy(): Promise<{
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    forbiddenPatterns: string[];
  }> {
    return {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      forbiddenPatterns: []
    };
  }

  async getRegistrationStatus(): Promise<{
    registrationEnabled: boolean;
    emailVerificationRequired: boolean;
    defaultRoles: string[];
  }> {
    return {
      registrationEnabled: true,
      emailVerificationRequired: false,
      defaultRoles: ['USER']
    };
  }

  async validateRegistrationData(data: SignupRequest): Promise<{
    username: { isValid: boolean; isValidating: boolean; errors: string[]; suggestions: string[]; lastValidated?: string };
    email: { isValid: boolean; isValidating: boolean; errors: string[]; suggestions: string[]; lastValidated?: string };
    password: { isValid: boolean; isValidating: boolean; errors: string[]; suggestions: string[]; lastValidated?: string; score?: number };
    overall: { valid: boolean; errors: string[]; warnings: string[] };
  }> {
    const [usernameResult, emailResult, passwordResult] = await Promise.all([
      this.validateUsername(data.username),
      this.validateEmail(data.email),
      this.validatePassword(data.password)
    ]);

    const allErrors = [
      ...usernameResult.errors,
      ...emailResult.errors,
      ...passwordResult.errors
    ];

    return {
      username: {
        isValid: usernameResult.valid && usernameResult.available,
        isValidating: false,
        errors: usernameResult.errors,
        suggestions: usernameResult.suggestions,
        lastValidated: new Date().toISOString()
      },
      email: {
        isValid: emailResult.valid && emailResult.available,
        isValidating: false,
        errors: emailResult.errors,
        suggestions: [],
        lastValidated: new Date().toISOString()
      },
      password: {
        isValid: passwordResult.valid,
        isValidating: false,
        errors: passwordResult.errors,
        suggestions: passwordResult.suggestions,
        lastValidated: new Date().toISOString(),
        score: passwordResult.score
      },
      overall: {
        valid: usernameResult.valid && usernameResult.available && emailResult.valid && emailResult.available && passwordResult.valid,
        errors: allErrors,
        warnings: []
      }
    };
  }

  private getCachedResult(key: string): any | null {
    const cached = this.validationCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }
    if (cached) {
      this.validationCache.delete(key);
    }
    return null;
  }

  private setCacheResult(key: string, result: any, duration?: number): void {
    this.validationCache.set(key, {
      result,
      timestamp: Date.now()
    });

    setTimeout(() => {
      this.validationCache.delete(key);
    }, duration || this.CACHE_DURATION);
  }

  clearCache(): void {
    this.validationCache.clear();
  }
}

const validationAPI = new ValidationAPI();
export default validationAPI;