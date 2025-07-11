'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import authAPI from '@/src/services/api/authAPI';
import validationAPI from '@/src/services/api/validationAPI';
import { 
  SignupRequest, 
  SignupResponse 
} from '@/types/auth';
import { 
  ValidationState, 
  PasswordPolicy, 
  RegistrationStatus,
  ValidationSummary 
} from '@/types/validation';

interface SignupContextType {
  loading: boolean;
  error: string | null;
  success: string | null;
  
  validations: Record<string, ValidationState>;
  passwordPolicy: PasswordPolicy | null;
  registrationStatus: RegistrationStatus | null;
  suggestions: string[];
  
  signup: (data: SignupRequest) => Promise<{ success: boolean; response?: SignupResponse }>;
  validateField: (field: string, value: string) => Promise<void>;
  validateAllFields: (data: SignupRequest) => Promise<ValidationSummary>;
  generateUsernameSuggestions: (email: string, firstName?: string, lastName?: string) => Promise<void>;
  
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

export function EnhancedSignupProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(signupReducer, initialState);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [policy, status] = await Promise.all([
          validationAPI.getPasswordPolicy(),
          validationAPI.getRegistrationStatus()
        ]);
        
        dispatch({ type: 'SET_PASSWORD_POLICY', payload: policy });
        dispatch({ type: 'SET_REGISTRATION_STATUS', payload: status });
      } catch (error: any) {
        console.error('Failed to load initial signup data:', error);
      }
    };

    loadInitialData();
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS', payload: null });

    try {
      const validation = await validationAPI.validateRegistrationData(data);
      
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

      const response = await authAPI.signUp(data);
      
      if (response.success) {
        const successMessage = response.verificationEmailSent 
          ? 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.'
          : 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
        
        dispatch({ type: 'SET_SUCCESS', payload: successMessage });
        dispatch({ type: 'CLEAR_ALL_VALIDATIONS' });
        
        return { success: true, response };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        
        if (response.errors) {
          response.errors.forEach(error => {
            let field = '';
            if (error.includes('username') || error.includes('nom d\'utilisateur')) {
              field = 'username';
            } else if (error.includes('email')) {
              field = 'email';
            } else if (error.includes('password') || error.includes('mot de passe')) {
              field = 'password';
            }

            if (field) {
              const validationState: ValidationState = {
                isValid: false,
                isValidating: false,
                errors: [error],
                suggestions: []
              };

              dispatch({
                type: 'SET_FIELD_VALIDATION',
                payload: { field, validation: validationState }
              });
            }
          });
        }
        
        return { success: false, response };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de l\'inscription';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false };
    }
  }, []);

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
          result = await validationAPI.validateUsername(value);
          dispatch({
            type: 'SET_FIELD_VALIDATION',
            payload: {
              field,
              validation: {
                isValid: result.valid && result.available,
                isValidating: false,
                errors: result.errors,
                suggestions: result.suggestions,
                lastValidated: new Date().toISOString()
              }
            }
          });
          break;

        case 'email':
          result = await validationAPI.validateEmail(value);
          dispatch({
            type: 'SET_FIELD_VALIDATION',
            payload: {
              field,
              validation: {
                isValid: result.valid && result.available,
                isValidating: false,
                errors: result.errors,
                suggestions: [],
                lastValidated: new Date().toISOString()
              }
            }
          });
          break;

        case 'password':
          result = await validationAPI.validatePassword(value);
          dispatch({
            type: 'SET_FIELD_VALIDATION',
            payload: {
              field,
              validation: {
                isValid: result.valid,
                isValidating: false,
                errors: result.errors,
                suggestions: result.suggestions,
                score: result.score,
                lastValidated: new Date().toISOString()
              }
            }
          });
          break;

        default:
          throw new Error(`Unknown field: ${field}`);
      }
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

  const validateAllFields = useCallback(async (data: SignupRequest): Promise<ValidationSummary> => {
    try {
      const summary = await validationAPI.validateRegistrationData(data);
      
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

  const generateUsernameSuggestions = useCallback(async (
    email: string, 
    firstName?: string, 
    lastName?: string
  ) => {
    try {
      const suggestions = await validationAPI.generateUsernameSuggestions(
        email, 
        firstName, 
        lastName
      );
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
    } catch (error: any) {
      console.error('Failed to generate username suggestions:', error);
      dispatch({ type: 'SET_SUGGESTIONS', payload: [] });
    }
  }, []);

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

export function useEnhancedSignup(): SignupContextType {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useEnhancedSignup must be used within an EnhancedSignupProvider');
  }
  return context;
}

export function useSignup() {
  const { 
    loading, 
    error, 
    success, 
    signup: enhancedSignup,
    clearError 
  } = useEnhancedSignup();
  
  return {
    loading,
    error,
    success,
    signup: async (formData: any) => {
      const signupData: SignupRequest = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      
      const result = await authAPI.signUp(signupData);
      return result.success;
    },
    clearError
  };
}