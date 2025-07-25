import { APIClient } from '../api/APIClient';
import { contractQueries } from '../api/graphql/queries/contract/contractQueries';
import { contractMutations } from '../api/graphql/mutations/contract/contractMutations';
import { 
  ContractStatus,
  SignerRole,
  SignatureType
} from '../types/Contract';
import type { 
  ContractResponse,
  CreateContractInput,
  UpdateContractInput,
  SignContractInput,
  SendContractInput,
  CreateContractResponse,
  UpdateContractResponse,
  SignContractResponse,
  SendContractResponse,
  GetContractResponse,
  GetContractsResponse
} from '../types/Contract';

/**
 * The `Contract` class manages contract-related requests within the application.
 * Provides methods to create, retrieve, update, sign, and send contracts.
 */
export class Contract {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Creates a new contract
   */
  async create(data: CreateContractInput): Promise<ContractResponse> {
    const query = contractMutations.CREATE_CONTRACT;
    const response = await this.client.mutate<CreateContractResponse>(query, { data });
    return response.createContract;
  }

  /**
   * Updates an existing contract
   */
  async update(id: string, data: UpdateContractInput): Promise<ContractResponse> {
    const query = contractMutations.UPDATE_CONTRACT;
    const response = await this.client.mutate<UpdateContractResponse>(query, { id, data });
    return response.updateContract;
  }

  /**
   * Signs a contract (client or provider)
   */
  async sign(data: SignContractInput): Promise<ContractResponse> {
    const query = contractMutations.SIGN_CONTRACT;
    const response = await this.client.mutate<SignContractResponse>(query, { data });
    return response.signContract;
  }

  /**
   * Sends a contract by email
   */
  async send(data: SendContractInput): Promise<{ success: boolean; message: string }> {
    const query = contractMutations.SEND_CONTRACT;
    const response = await this.client.mutate<SendContractResponse>(query, { data });
    return response.sendContract;
  }

  /**
   * Retrieves a contract by its ID
   */
  async getById(contractId: string): Promise<ContractResponse> {
    const query = contractQueries.GET_CONTRACT_BY_ID;
    const response = await this.client.query<GetContractResponse>(query, { id: contractId });
    return response.contract;
  }

  /**
   * Retrieves all contracts.
   */
  async list(): Promise<ContractResponse[]> {
    const query = contractQueries.GET_ALL_CONTRACTS;
    const response = await this.client.query<GetContractsResponse>(query, {});
    return response.contracts;
  }

  /**
   * Retrieves contracts by organization ID
   */
  async getByOrganizationId(organizationId: string): Promise<ContractResponse[]> {
    const query = contractQueries.GET_CONTRACTS_BY_ORGANIZATION_ID;
    const response = await this.client.query<GetContractsResponse>(query, { organizationId });
    return response.contracts;
  }
} 