export interface TokenStorage {
  saveAccessToken(token: string): void;
  saveRefreshToken(token: string): void;
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  clearTokens(): void; 
}

export type TokenStorageKind = 'app' | 'user';

