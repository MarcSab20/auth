// src/hooks/useValidation.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import validationAPI from '@/src/services/api/validationAPI';
import {
  ValidationState,
  PasswordPolicy,
  RegistrationStatus,
  PasswordValidationResult,
  UsernameValidationResult,
  EmailValidationResult
} from '@/types/validation';

/**
 * Hook pour validation d'un champ spécifique avec debouncing
 */
export function useValidation(
  type: 'username' | 'email' | 'password',
  value: string,
  enabled: boolean = true
) {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    isValidating: false,
    errors: [],
    suggestions: [],
  });

  const debouncedValue = useDebounce(value, 500);
  const abortControllerRef = useRef<AbortController | null>(null);

  const validateField = useCallback(async (fieldValue: string) => {
    if (!enabled || !fieldValue.trim()) {
      setValidation({
        isValid: false,
        isValidating: false,
        errors: [],
        suggestions: [],
      });
      return;
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setValidation(prev => ({
      ...prev,
      isValidating: true,
      errors: [],
    }));

    try {
      let result;
      
      switch (type) {
        case 'username':
          result = await validationAPI.validateUsername(fieldValue) as UsernameValidationResult;
          setValidation({
            isValid: result.valid && result.available,
            isValidating: false,
            errors: result.errors,
            suggestions: result.suggestions,
            lastValidated: new Date().toISOString(),
          });
          break;

        case 'email':
          result = await validationAPI.validateEmail(fieldValue) as EmailValidationResult;
          setValidation({
            isValid: result.valid && result.available,
            isValidating: false,
            errors: result.errors,
            suggestions: [],
            lastValidated: new Date().toISOString(),
          });
          break;

        case 'password':
          result = await validationAPI.validatePassword(fieldValue) as PasswordValidationResult;
          setValidation({
            isValid: result.valid,
            isValidating: false,
            errors: result.errors,
            suggestions: result.suggestions,
            score: result.score,
            lastValidated: new Date().toISOString(),
          });
          break;
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setValidation({
          isValid: false,
          isValidating: false,
          errors: [error.message || 'Erreur de validation'],
          suggestions: [],
        });
      }
    }
  }, [type, enabled]);

  // Déclencher la validation quand la valeur change (avec debounce)
  useEffect(() => {
    if (debouncedValue) {
      validateField(debouncedValue);
    }
  }, [debouncedValue, validateField]);

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const retry = useCallback(() => {
    if (value.trim()) {
      validateField(value);
    }
  }, [value, validateField]);

  return {
    validation,
    retry,
    isValidating: validation.isValidating,
    isValid: validation.isValid,
    errors: validation.errors,
    suggestions: validation.suggestions,
  };
}

/**
 * Hook pour la politique de mot de passe
 */
export function usePasswordPolicy() {
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const policyData = await validationAPI.getPasswordPolicy();
      setPolicy(policyData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la politique');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  return {
    policy,
    loading,
    error,
    retry: fetchPolicy,
  };
}

/**
 * Hook pour les suggestions de nom d'utilisateur
 */
export function useUsernameSuggestions(
  email: string,
  firstName?: string,
  lastName?: string,
  enabled: boolean = true
) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedEmail = useDebounce(email, 1000);
  const debouncedFirstName = useDebounce(firstName || '', 1000);
  const debouncedLastName = useDebounce(lastName || '', 1000);

  const generateSuggestions = useCallback(async () => {
    if (!enabled || !debouncedEmail.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const suggestionsData = await validationAPI.generateUsernameSuggestions(
        debouncedEmail,
        debouncedFirstName,
        debouncedLastName
      );
      setSuggestions(suggestionsData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération des suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedEmail, debouncedFirstName, debouncedLastName, enabled]);

  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  const refresh = useCallback(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  return {
    suggestions,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook pour le statut d'enregistrement
 */
export function useRegistrationStatus() {
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const statusData = await validationAPI.getRegistrationStatus();
      setStatus(statusData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du statut');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    retry: fetchStatus,
  };
}

/**
 * Hook pour validation multiple de formulaire
 */
export function useFormValidation(initialData: Record<string, string>) {
  const [validations, setValidations] = useState<Record<string, ValidationState>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (field: string, value: string) => {
    setValidations(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        isValidating: true,
      }
    }));

    try {
      let result;
      
      switch (field) {
        case 'username':
          result = await validationAPI.validateUsername(value);
          break;
        case 'email':
          result = await validationAPI.validateEmail(value);
          break;
        case 'password':
          result = await validationAPI.validatePassword(value);
          break;
        default:
          throw new Error(`Unknown field: ${field}`);
      }

      setValidations(prev => ({
        ...prev,
        [field]: {
          isValid: field === 'username' ? 
            (result as UsernameValidationResult).valid && (result as UsernameValidationResult).available :
            field === 'email' ? 
            (result as EmailValidationResult).valid && (result as EmailValidationResult).available :
            (result as PasswordValidationResult).valid,
          isValidating: false,
          errors: result.errors || [],
          suggestions: field === 'username' ? 
            (result as UsernameValidationResult).suggestions || [] :
            field === 'password' ?
            (result as PasswordValidationResult).suggestions || [] :
            [],
          lastValidated: new Date().toISOString(),
          score: field === 'password' ? (result as PasswordValidationResult).score : undefined,
        }
      }));
    } catch (error: any) {
      setValidations(prev => ({
        ...prev,
        [field]: {
          isValid: false,
          isValidating: false,
          errors: [error.message || 'Erreur de validation'],
          suggestions: [],
        }
      }));
    }
  }, []);

  const validateAll = useCallback(async (data: Record<string, string>) => {
    setIsValidating(true);
    
    const promises = Object.entries(data).map(([field, value]) => 
      validateField(field, value)
    );
    
    await Promise.all(promises);
    setIsValidating(false);
  }, [validateField]);

  const isFormValid = useCallback(() => {
    return Object.values(validations).every(validation => validation.isValid);
  }, [validations]);

  const getFieldValidation = useCallback((field: string): ValidationState => {
    return validations[field] || {
      isValid: false,
      isValidating: false,
      errors: [],
      suggestions: [],
    };
  }, [validations]);

  return {
    validations,
    isValidating,
    validateField,
    validateAll,
    isFormValid,
    getFieldValidation,
  };
}