'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { SMPClient, Persistence } from 'smp-sdk-ts';
import { 
  SignupRequest, 
  SignupResponse 
} from '@/types/auth';
import { 
  ValidationState, 
  PasswordPolicy, 
  RegistrationStatus,
  ValidationSummary, 
  EmailValidationResult,
  UsernameValidationResult,
  PasswordValidationResult
} from '@/types/validation';

const storage = new Persistence('localStorage');

const smpClient = new SMPClient({
  appId: process.env.NEXT_PUBLIC_APP_ID || '',
  appSecret: process.env.NEXT_PUBLIC_APP_SECRET || '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  defaultLanguage: 'fr_FR',
  appAccessDuration: 30,
  userAccessDuration: 30,
  minUserAccessDuration: 30,
  minAppAccessDuration: 30,
  persistence: 'localStorage', 
  storage: storage, 
});

interface SignupContextType {
  loading: boolean;
  error: string | null;
  success: string | null;
  
  // Validation states
  validations: Record<string, ValidationState>;
  passwordPolicy: PasswordPolicy | null;
  registrationStatus: RegistrationStatus | null;
  suggestions: string[];
  
  // Core signup functions
  signup: (data: SignupRequest, acceptNewsletter?: boolean, organizationID?: string) => Promise<{ success: boolean; response?: SignupResponse }>;
  
  // Validation functions
  validateField: (field: string, value: string) => Promise<void>;
  validateAllFields: (data: SignupRequest) => Promise<ValidationSummary>;
  generateUsernameSuggestions: (email: string, firstName?: string, lastName?: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  clearSuccess: () => void;
  clearValidation: (field: string) => void;
  clearAllValidations: () => void;
  isFormValid: () => boolean;
  getFieldValidation: (field: string) => ValidationState;
}

type SignupAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_FIELD_VALIDATION'; payload: { field: string; validation: ValidationState } }
  | { type: 'SET_PASSWORD_POLICY'; payload: PasswordPolicy | null }
  | { type: 'SET_REGISTRATION_STATUS'; payload: RegistrationStatus | null }
  | { type: 'SET_SUGGESTIONS'; payload: string[] }
  | { type: 'CLEAR_VALIDATION'; payload: string }
  | { type: 'CLEAR_ALL_VALIDATIONS' }
  | { type: 'RESET_STATE' };

interface SignupState {
  loading: boolean;
  error: string | null;
  success: string | null;
  validations: Record<string, ValidationState>;
  passwordPolicy: PasswordPolicy | null;
  registrationStatus: RegistrationStatus | null;
  suggestions: string[];
}

const initialState: SignupState = {
  loading: false,
  error: null,
  success: null,
  validations: {},
  passwordPolicy: null,
  registrationStatus: null,
  suggestions: [],
};

function signupReducer(state: SignupState, action: SignupAction): SignupState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, loading: false, error: null };
    
    case 'SET_FIELD_VALIDATION':
      return {
        ...state,
        validations: {
          ...state.validations,
          [action.payload.field]: action.payload.validation
        }
      };
    
    case 'SET_PASSWORD_POLICY':
      return { ...state, passwordPolicy: action.payload };
    
    case 'SET_REGISTRATION_STATUS':
      return { ...state, registrationStatus: action.payload };
    
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    
    case 'CLEAR_VALIDATION':
      const { [action.payload]: removed, ...remainingValidations } = state.validations;
      return { ...state, validations: remainingValidations };
    
    case 'CLEAR_ALL_VALIDATIONS':
      return { ...state, validations: {} };
    
    case 'RESET_STATE':
      return { ...initialState };
    
    default:
      return state;
  }
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(signupReducer, initialState);

  // Initialisation de la SDK et chargement des données
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Initialiser la SDK
        await smpClient.authenticateApp();
        
        // Charger les données initiales
        const [policy, status] = await Promise.all([
          loadPasswordPolicy(),
          loadRegistrationStatus()
        ]);
        
        dispatch({ type: 'SET_PASSWORD_POLICY', payload: policy });
        dispatch({ type: 'SET_REGISTRATION_STATUS', payload: status });
      } catch (error: any) {
        console.error('Failed to initialize SDK:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Erreur d\'initialisation' });
      }
    };

    initializeSDK();
  }, []);

  // Fonction pour charger la politique de mot de passe
  const loadPasswordPolicy = async (): Promise<PasswordPolicy> => {
    // En attendant l'implémentation SDK, utiliser les valeurs par défaut
    return {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      forbiddenPatterns: []
    };
  };

  // Fonction pour charger le statut d'enregistrement
  const loadRegistrationStatus = async (): Promise<RegistrationStatus> => {
    // En attendant l'implémentation SDK, utiliser les valeurs par défaut
    return {
      registrationEnabled: true,
      emailVerificationRequired: false,
      defaultRoles: ['USER']
    };
  };

  // Fonction principale de signup utilisant la SDK
  const signup = useCallback(async (
    data: SignupRequest, 
    acceptNewsletter: boolean = false, 
    organizationID?: string
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      console.log('🔄 [SDK] Starting signup with:', { username: data.username, email: data.email });

      // Validation complète avant l'envoi
      const validation = await validateAllFields(data);
      
      if (!validation.overall.valid) {
        Object.entries(validation).forEach(([field, fieldValidation]) => {
          if (field !== 'overall') {
            dispatch({
              type: 'SET_FIELD_VALIDATION',
              payload: { 
                field, 
                validation: fieldValidation as ValidationState 
              }
            });
          }
        });
        
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Veuillez corriger les erreurs avant de continuer' 
        });
        return { success: false };
      }

      // Créer d'abord le profil si nécessaire
      let profileID: string | undefined;
      
      if (data.firstName || data.lastName) {
        try {
          const profileData = await smpClient.profile.createProfile({
            authorID: '1', // Sera remplacé par l'ID utilisateur après création
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            state: 'online'
          });
          profileID = profileData.profileID;
          console.log('✅ [SDK] Profile created:', profileID);
        } catch (profileError) {
          console.warn('⚠️ [SDK] Profile creation failed:', profileError);
          // Continuer sans profil
        }
      }

      // Préparer les données pour la SDK
      const signupData = {
        username: data.username,
        email: data.email,
        password: data.password,
        userKind: 'client',
        state: 'online',
        profileID: profileID || undefined,
        plan: 'free',
        twoFactorEnabled: false,
        rsaPublicKey: ''
      };

      // Appel SDK selon le contexte
      let response: any;
      
      if (organizationID) {
        // Signup après invitation
        console.log('🏢 [SDK] Signup after invitation to organization:', organizationID);
        response = await smpClient.manageOrganization.signupAfterInvitation(
          signupData,
          organizationID,
          data.firstName,
          data.lastName
        );
      } else {
        // Signup normal
        console.log('👤 [SDK] Normal signup');
        response = await smpClient.signup.createUser(signupData);
      }

      console.log('✅ [SDK] Signup successful:', response);

      // Gestion de la newsletter si activée
      if (acceptNewsletter && response.userID) {
        try {
          await smpClient.mailing.createNewsletterContact({
            email: data.email,
            userID: response.userID,
            isNewsletterSubscriber: true,
            source: organizationID ? 'signup_invitation' : 'signup_normal',
            firstName: data.firstName || '',
            lastName: data.lastName || ''
          });
          console.log('✅ [SDK] Newsletter subscription added');
        } catch (newsletterError) {
          console.warn('⚠️ [SDK] Newsletter subscription failed:', newsletterError);
          // Ne pas faire échouer l'inscription pour la newsletter
        }
      }

      const successMessage = organizationID 
        ? 'Inscription réussie ! Vous avez rejoint l\'organisation.'
        : 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
      
      dispatch({ type: 'SET_SUCCESS', payload: successMessage });
      dispatch({ type: 'CLEAR_ALL_VALIDATIONS' });
      
      return { 
        success: true, 
        response: {
          success: true,
          userId: response.userID,
          message: successMessage,
          verificationEmailSent: false
        }
      };

    } catch (error: any) {
      console.error('❌ [SDK] Signup failed:', error);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      
      // Analyser l'erreur pour fournir un message plus précis
      if (error.message) {
        if (error.message.includes('already exist') || error.message.includes('déjà utilisé')) {
          errorMessage = 'Cet email ou nom d\'utilisateur est déjà utilisé';
        } else if (error.message.includes('invalid') || error.message.includes('invalide')) {
          errorMessage = 'Données invalides';
        } else {
          errorMessage = error.message;
        }
      }

      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      return { 
        success: false, 
        response: {
          success: false,
          message: errorMessage,
          errors: [errorMessage]
        }
      };
    }
  }, []);

  // Validation de champs individuels
  const validateField = useCallback(async (field: string, value: string) => {
  if (!value.trim()) {
    const emptyValidation: ValidationState = {
      isValid: false,
      isValidating: false,
      errors: [],
      suggestions: []
    };
    
    dispatch({
      type: 'SET_FIELD_VALIDATION',
      payload: { field, validation: emptyValidation }
    });
    return;
  }

  const validatingState: ValidationState = {
    isValid: false,
    isValidating: true,
    errors: [],
    suggestions: []
  };

  dispatch({
    type: 'SET_FIELD_VALIDATION',
    payload: { field, validation: validatingState }
  });

  try {
    let result;
    
    switch (field) {
      case 'username':
        result = await validateUsername(value);
        break;
      case 'email':
        result = await validateEmail(value);
        break;
      case 'password':
        result = await validatePassword(value);
        break;
      default:
        throw new Error(`Unknown field: ${field}`);
    }

      const validation: ValidationState = {
      isValid: result.valid,
      isValidating: false,
      errors: result.errors || [],
      suggestions: result.suggestions || [],
      lastValidated: new Date().toISOString(),
      score: 'score' in result ? result.score : undefined
    };

    dispatch({
      type: 'SET_FIELD_VALIDATION',
      payload: { field, validation }
    });
  } catch (error: any) {
    const errorValidation: ValidationState = {
      isValid: false,
      isValidating: false,
      errors: [error.message || 'Erreur de validation'],
      suggestions: []
    };

    dispatch({
      type: 'SET_FIELD_VALIDATION',
      payload: { field, validation: errorValidation }
    });
  }
}, []);

  // Fonctions de validation individuelles
  const validateUsername = async (username: string): Promise<UsernameValidationResult> => {
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

    return {
      valid: errors.length === 0,
      available: errors.length === 0,
      errors,
      suggestions
    };
  };

  const validateEmail = async (email: string): Promise<EmailValidationResult> => {
    const errors: string[] = [];
    const suggestions: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errors.push('Format d\'email invalide');
    }

    return {
      valid: errors.length === 0,
      available: errors.length === 0,
      deliverable: errors.length === 0,
      errors,
      suggestions
    };
  };

  const validatePassword = async (password: string): Promise<PasswordValidationResult> => {
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
  };

  // Validation de tous les champs
  const validateAllFields = useCallback(async (data: SignupRequest): Promise<ValidationSummary> => {
    try {
      const [usernameResult, emailResult, passwordResult] = await Promise.all([
        validateUsername(data.username),
        validateEmail(data.email),
        validatePassword(data.password)
      ]);

      const allErrors = [
        ...usernameResult.errors,
        ...emailResult.errors,
        ...passwordResult.errors
      ];

      const summary: ValidationSummary = {
        username: {
          isValid: usernameResult.valid,
          isValidating: false,
          errors: usernameResult.errors,
          suggestions: usernameResult.suggestions,
          lastValidated: new Date().toISOString()
        },
        email: {
          isValid: emailResult.valid,
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
          valid: usernameResult.valid && emailResult.valid && passwordResult.valid,
          errors: allErrors,
          warnings: []
        }
      };

      // Mettre à jour le state avec les validations
      Object.entries(summary).forEach(([field, validation]) => {
        if (field !== 'overall') {
          dispatch({
            type: 'SET_FIELD_VALIDATION',
            payload: { field, validation: validation as ValidationState }
          });
        }
      });

      return summary;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la validation');
    }
  }, []);

  // Génération de suggestions de nom d'utilisateur
  const generateUsernameSuggestions = useCallback(async (
    email: string, 
    firstName?: string, 
    lastName?: string
  ) => {
    try {
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
      
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions.slice(0, 5) });
    } catch (error: any) {
      console.error('Failed to generate username suggestions:', error);
      dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
    }
  }, []);

  // Fonctions utilitaires
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const clearSuccess = useCallback(() => {
    dispatch({ type: 'SET_SUCCESS', payload: null });
  }, []);

  const clearValidation = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_VALIDATION', payload: field });
  }, []);

  const clearAllValidations = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_VALIDATIONS' });
  }, []);

  const isFormValid = useCallback((): boolean => {
    const requiredFields = ['username', 'email', 'password'];
    return requiredFields.every(field => 
      state.validations[field]?.isValid === true
    );
  }, [state.validations]);

  const getFieldValidation = useCallback((field: string): ValidationState => {
    return state.validations[field] || {
      isValid: false,
      isValidating: false,
      errors: [],
      suggestions: []
    };
  }, [state.validations]);

  const contextValue: SignupContextType = {
    loading: state.loading,
    error: state.error,
    success: state.success,
    validations: state.validations,
    passwordPolicy: state.passwordPolicy,
    registrationStatus: state.registrationStatus,
    suggestions: state.suggestions,
    signup,
    validateField,
    validateAllFields,
    generateUsernameSuggestions,
    clearError,
    clearSuccess,
    clearValidation,
    clearAllValidations,
    isFormValid,
    getFieldValidation,
  };

  return React.createElement(
    SignupContext.Provider,
    { value: contextValue },
    children
  );
}

export function useSignup(): SignupContextType {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
}
