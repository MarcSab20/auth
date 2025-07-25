export type PersistenceKind = 'cookie' | 'localStorage' | 'sessionStorage' | 'memory'

export interface PersistenceType {
  set(key: string, value: any): boolean;
  get(key: string): string;
  remove(key: string): boolean;
}

export class Persistence implements PersistenceType {
    private persistenceKind: PersistenceKind;
    private memoryStore: Record<string, any>            = {};
    public static LocalStorageKind:PersistenceKind      = 'localStorage';
    public static CookieKind:PersistenceKind            = 'cookie';
    public static SessionStorageKind:PersistenceKind    = 'sessionStorage';
    public static MemoryKind:PersistenceKind            = 'memory';
    
    constructor(storageKind: PersistenceKind = 'localStorage') {
        this.persistenceKind  = storageKind;
    }

    set(key: string, value: any) {
        let localStorage = undefined;
        let sessionStorage = undefined;
        if (typeof window !== 'undefined' && window.localStorage){
            localStorage = window.localStorage;
        }
        if (typeof window !== 'undefined' && window.sessionStorage){
            sessionStorage = window.sessionStorage;
        }
        if (this.persistenceKind === 'cookie') {
            document.cookie = `${key}=${value}; Secure; HttpOnly;`;
        } else if (this.persistenceKind === 'localStorage') {
            localStorage?.setItem(key, JSON.stringify(value));
        } else if (this.persistenceKind === 'sessionStorage') {
            sessionStorage?.setItem(key, JSON.stringify(value));
        } else {
            this.memoryStore[key] = value;
        }
        return true;
    }

    get(key: string): any {
        let localStorage = undefined;
        let sessionStorage = undefined;
        if (typeof window !== 'undefined' && window.localStorage){
            localStorage = window.localStorage;
        }
        if (typeof window !== 'undefined' && window.sessionStorage){
            sessionStorage = window.sessionStorage;
        }
        if (this.persistenceKind === 'cookie') {
            const cookies = document.cookie.split('; ');
            const cookie = cookies.find((c) => c.startsWith(key));
            return cookie ? cookie.split('=')[1] : null;
        } else if (this.persistenceKind === 'localStorage') {
            return JSON.parse(localStorage?.getItem(key) || 'null');
        } else if (this.persistenceKind === 'sessionStorage') {
            return JSON.parse(sessionStorage?.getItem(key) || 'null');
        } else {
            return this.memoryStore[key] || null;
        }
    }

    remove(key: string) {
        if (this.persistenceKind === 'cookie') {
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        } else if (this.persistenceKind === 'localStorage') {
            localStorage.removeItem(key);
        } else if (this.persistenceKind === 'sessionStorage') {
            sessionStorage.removeItem(key);
        } else {
            delete this.memoryStore[key];
        }
        return true;
    }
}
