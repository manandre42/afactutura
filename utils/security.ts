import { db } from '../db';
import { AuditLog } from '../types';

/**
 * Logs an immutable action to the audit trail
 */
export const logAction = async (action: string, detail: string, user: string = 'Admin') => {
  const log: AuditLog = {
    action,
    user,
    timestamp: new Date().toISOString(),
    detail,
    // In a real scenario, this hash would link to the previous log hash to form a chain
    hash: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
  };
  
  try {
    await db.logs.add(log);
    console.log(`[AUDIT] ${action}: ${detail}`);
  } catch (e) {
    console.error("Failed to write audit log", e);
  }
};

/**
 * Generates an encryption key from a password using PBKDF2
 */
const getKeyFromPassword = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts a string using AES-256-GCM
 */
export const encryptBackup = async (data: string, password: string): Promise<{ encrypted: ArrayBuffer, salt: Uint8Array, iv: Uint8Array }> => {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const key = await getKeyFromPassword(password, salt);
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    enc.encode(data)
  );

  return { encrypted, salt, iv };
};

/**
 * Creates a downloadable encrypted backup file
 */
export const createSecureBackup = async (password: string) => {
  await logAction('BACKUP_INIT', 'User requested secure backup');
  
  // Gather all data
  const invoices = await db.invoices.toArray();
  const clients = await db.clients.toArray();
  const logs = await db.logs.toArray();
  const settings = await db.settings.toArray();

  const dump = JSON.stringify({
    timestamp: new Date().toISOString(),
    version: '1.0',
    data: { invoices, clients, logs, settings }
  });

  try {
    const { encrypted, salt, iv } = await encryptBackup(dump, password);

    // Combine Salt + IV + Encrypted Data into a single blob
    // Layout: [Salt (16)] [IV (12)] [Data (...)]
    const combinedBuffer = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
    combinedBuffer.set(salt, 0);
    combinedBuffer.set(iv, salt.byteLength);
    combinedBuffer.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

    const blob = new Blob([combinedBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `afactura_backup_${new Date().toISOString().split('T')[0]}.enc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    await logAction('BACKUP_SUCCESS', 'Secure backup generated successfully');
    return true;
  } catch (error) {
    console.error("Encryption failed", error);
    await logAction('BACKUP_FAIL', `Encryption failed: ${error}`);
    throw error;
  }
};