// smp-sdk-ts/src/forgotpassword/estimate.ts

import { APIClient } from '../api/APIClient';
import { MUTATION_FORGOT_PASSWORD, MUTATION_RESET_PASSWORD } from '../api/graphql/mutations/authMutations';

export interface ForgotPasswordInput {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
    success: boolean;
}

export interface ResetPasswordInput {
    token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
    success: boolean;
}

export class Password {
    private client: APIClient;

    constructor(client: APIClient) {
        this.client = client;
    }

    async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
        const mutation = MUTATION_FORGOT_PASSWORD;
        const variables = { email };
        const response = await this.client.mutate(mutation, variables) as { forgotPassword: ForgotPasswordResponse };
        return response.forgotPassword;
    }

    async resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResponse> {
        console.log(input);
        const mutation = MUTATION_RESET_PASSWORD;
        console.log(mutation);
        const variables = { input }; 
        const response = await this.client.mutate(mutation, variables) as { resetPassword: ResetPasswordResponse };
        return response.resetPassword;
    }
}
