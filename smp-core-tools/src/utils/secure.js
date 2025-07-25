import { randomBytes, createCipheriv, createDecipheriv} from 'crypto';

const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_KEY ?? "12345678901234567890123456789012";

const iv = process.env.ENCRYPTION_IV_KEY ?? randomBytes(16);

// Fonction de chiffrement
export function encryptData(data, iv = iv, key = key) {
  const cipher = createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update
  (data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Fonction de déchiffrement
export function decryptData(encryptedData, iv = iv, key = key) {
  const decipher = createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
