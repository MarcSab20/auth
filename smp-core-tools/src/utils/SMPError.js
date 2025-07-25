//src/utils/SMPErrors.js

// Création d'une classe de base pour les exceptions personnalisées
class SMPError extends Error {
  constructor(message, code, extension = {}) {
    super(message);
    this.message = message;
    this.extension = extension;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Classe spécifique d'exception pour une erreur d'authentification
class AuthenticationError extends SMPError {
  constructor(message = 'Authentication Error ', code = 'AUTH_ERR_001') {
    super(message, code);
  }
}

// Classe spécifique d'exception pour une erreur de connexion à une base de donnée
class DBaseAccesError extends SMPError {
  constructor(message = 'Database Acces Error ', code = 'DB_ACCES_ERR_001') {
    super(message, code);
  }
}

// Classe spécifique d'exception pour une erreur de connexion à une API Externe
class ExternalAPIAccesError extends SMPError {
  constructor(message = 'External API Acces Error ', code = 'EAPI_ACCES_ERR_001') {
    super(message, code);
  }
}

// Classe spécifique d'exception pour une erreur de connexion à une API Interne
class InternalAPIAccesError extends SMPError {
  constructor(message = 'Internal API Acces Error ', code = 'IAPI_ACCES_ERR_001') {
    super(message, code);
  }
}

// Classe spécifique d'exception pour une erreur de validation des données
class DataValidationError extends SMPError {
  constructor(message = 'Data Validation Error ', code = 'DVALIDATION_ERR_001') {
    super(message, code);
  }
}

// Classe spécifique d'exception pour une erreur de validation des procédure
class WorkflowValidationError extends SMPError {
  constructor(message = 'Workflow Validation Error ', code = 'WVALIDATION_ERR_001') {
    super(message, code);
  }
}

// Classe spécifique d'exception pour une erreur de validation des procédure
class UserInputDataValidationError extends DataValidationError {
  constructor(message = 'User Input Validation Error ', code = 'UIDVALIDATION_ERR_001') {
    super(message, code);
  }
}

export {SMPError, DBaseAccesError, AuthenticationError, 
  ExternalAPIAccesError, InternalAPIAccesError, UserInputDataValidationError, 
  DataValidationError, WorkflowValidationError};