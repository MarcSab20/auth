import { statusByServices } from './api/graphql/queries/index.js';
import { serviceQueries } from "./api/graphql/queries/index.js";
import { logger } from "./utils/Logger.js";
import { APIClient } from "./api/APIClient.js"
import { SMPClient } from "./SMPClient.js"
import { Persistence } from './config/Persistence.js';
import { defaultLanguage } from './i18n/languages.js';

// Export types
export type { 
  EstimateDetails, 
  Negotiation, 
  CreateNegotiationInput, 
  NegotiationResponse,
  NegotiationStatus 
} from './types/Estimate';

export type {
  ContractResponse,
  CreateContractInput,
  UpdateContractInput,
  SignContractInput,
  SendContractInput,
  ContractStatus,
  SignerRole,
  SignatureType
} from './types/Contract';

export {
  MagicLinkGenerateRequest,
  MagicLinkVerifyRequest,
  MagicLinkGenerateResponse,
  MagicLinkVerifyResponse,
  MagicLinkStatusResponse
} from './controllers/MagicLinkController';
export * from './controllers';
export { MagicLink } from './controllers/MagicLinkController';

export { SMPClient, APIClient, serviceQueries, statusByServices } ;
export { Persistence, defaultLanguage, logger };
