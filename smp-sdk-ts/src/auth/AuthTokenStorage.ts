import { Persistence, PersistenceType } from "../config/Persistence.js";
import { TokenStorage, TokenStorageKind } from "./TokenStorageType.js";

export class AuthTokenStorage implements TokenStorage {
  private accessTokenKey = 'smp_access_token';
  private refreshTokenKey = 'smp_refresh_token';
  private persistence: PersistenceType;
  public static AppKind: TokenStorageKind = 'app'
  public static UserKind: TokenStorageKind = 'user'

  constructor(tokenStorageType: TokenStorageKind, persistence: PersistenceType, stringPrefixKey: string = "smp") {
    this.accessTokenKey   = `${stringPrefixKey}_${tokenStorageType}_access_token`;
    this.refreshTokenKey  = `${stringPrefixKey}_${tokenStorageType}_refresh_token`;
    this.persistence      = persistence;
  }

  saveAccessToken(token: string): void {
    this.persistence.set(this.accessTokenKey, token);
  }

  saveRefreshToken(token: string): void {
    this.persistence.set(this.refreshTokenKey, token);
  }

  getAccessToken(): string | null {
    return this.persistence.get(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return this.persistence.get(this.refreshTokenKey);
  }

  clearTokens(): void {
    this.persistence.remove(this.accessTokenKey);
    this.persistence.remove(this.refreshTokenKey);
  }
}
