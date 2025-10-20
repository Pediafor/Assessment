import { V4 } from "paseto";
import crypto from "crypto";

// Resolve keys lazily at call time to avoid failing on import and leaking secrets
function getPrivateKeyPem(): string {
  const env = process.env.PASETO_PRIVATE_KEY;
  if (!env) throw new Error("PASETO_PRIVATE_KEY not set");
  return env.startsWith('-----BEGIN') ? env : Buffer.from(env, 'base64').toString('utf8');
}

function getPublicKeyPem(): string {
  const env = process.env.PASETO_PUBLIC_KEY;
  if (!env) throw new Error("PASETO_PUBLIC_KEY not set");
  return env.startsWith('-----BEGIN') ? env : Buffer.from(env, 'base64').toString('utf8');
}

// Helper to convert time string to milliseconds
function parseTimeToMs(timeStr: string): number {
  const timeValue = parseInt(timeStr.slice(0, -1));
  const timeUnit = timeStr.slice(-1);
  
  switch (timeUnit) {
    case 'm': return timeValue * 60 * 1000;
    case 'h': return timeValue * 60 * 60 * 1000;
    case 'd': return timeValue * 24 * 60 * 60 * 1000;
    default: throw new Error(`Invalid time format: ${timeStr}`);
  }
}

// Helper to create key object from string
function createPrivateKey(keyString: string) {
  try {
    // If it's already a proper key format, use it directly
    return crypto.createPrivateKey(keyString);
  } catch {
    // If it fails, assume it's a raw key and create from buffer
    const keyBuffer = Buffer.from(keyString, 'base64');
    return crypto.createPrivateKey({
      key: keyBuffer,
      format: 'der',
      type: 'pkcs8'
    });
  }
}

function createPublicKey(keyString: string) {
  try {
    return crypto.createPublicKey(keyString);
  } catch {
    const keyBuffer = Buffer.from(keyString, 'base64');
    return crypto.createPublicKey({
      key: keyBuffer,
      format: 'der',
      type: 'spki'
    });
  }
}

// Sign an access token using the private key
export async function signAccessToken(payload: Record<string, unknown>, expiresIn = "15m") {
  const PRIVATE_KEY = getPrivateKeyPem();
  
  const now = new Date();
  const expiration = new Date(now.getTime() + parseTimeToMs(expiresIn));
  
  const tokenPayload = {
    ...payload,
    iss: 'user-service',
    aud: 'pediafor-assessment', 
    iat: now.toISOString(),
    exp: expiration.toISOString()
  };
  
  const privateKey = createPrivateKey(PRIVATE_KEY);
  return V4.sign(tokenPayload, privateKey);
}

// Verify an access token using the public key
export async function verifyAccessToken(token: string) {
  const PUBLIC_KEY = getPublicKeyPem();
  const publicKey = createPublicKey(PUBLIC_KEY);
  const payload = await V4.verify(token, publicKey) as any;
  
  // Check expiration
  if (payload.exp && new Date(payload.exp) < new Date()) {
    throw new Error('Token has expired');
  }
  
  // Check audience and issuer
  if (payload.aud !== 'pediafor-assessment' || payload.iss !== 'user-service') {
    throw new Error('Invalid token audience or issuer');
  }
  
  return payload;
}

// Aliases for backward compatibility with existing auth service
export async function generateAccessToken(payload: Record<string, unknown>): Promise<string> {
  return signAccessToken(payload, "15m");
}

export async function generateRefreshToken(payload: Record<string, unknown>): Promise<string> {
  return signAccessToken(payload, "7d");
}

export async function verifyToken(token: string): Promise<any> {
  return verifyAccessToken(token);
}
