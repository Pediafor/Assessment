import { V4 } from 'paseto';
import crypto from 'crypto';

export interface UserContext {
  id: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
}

interface TokenPayload {
  userId?: string;
  id?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  exp?: number;
  iat?: number;
}

export class WebSocketAuth {
  // Raw env var (may be PEM with escaped newlines or base64)
  private static rawPublicKey: string = process.env.PASETO_PUBLIC_KEY || '';
  private static keyObject: crypto.KeyObject | null = null;

  private static getPublicKey(): crypto.KeyObject | null {
    if (this.keyObject) return this.keyObject;
    const envVal = this.rawPublicKey;
    if (!envVal) return null;

    try {
      // Normalize: if looks like PEM, also replace escaped newlines
      let keyString = envVal;
      if (envVal.includes('-----BEGIN')) {
        keyString = envVal.replace(/\\n/g, '\n');
        this.keyObject = crypto.createPublicKey(keyString);
        return this.keyObject;
      }

      // Otherwise assume base64-encoded PEM
      const decoded = Buffer.from(envVal, 'base64').toString('utf8');
      const maybePem = decoded.includes('-----BEGIN') ? decoded : envVal;
      this.keyObject = crypto.createPublicKey(maybePem);
      return this.keyObject;
    } catch (e) {
      console.error('❌ Failed to construct public key from PASETO_PUBLIC_KEY:', (e as Error).message);
      return null;
    }
  }

  static async validateToken(token: string): Promise<UserContext | null> {
    try {
      const publicKey = this.getPublicKey();
      if (!publicKey) {
        console.error('❌ PASETO_PUBLIC_KEY not configured or invalid');
        return null;
      }

      // Verify PASETO token using KeyObject
      const payload = await V4.verify(token, publicKey) as TokenPayload & { iss?: string; aud?: string };
      
      if (!payload || typeof payload !== 'object') {
        return null;
      }

      // Validate audience and issuer to prevent token confusion
      if (payload.aud && payload.aud !== 'pediafor-assessment') {
        console.warn('⚠️ Invalid token audience:', payload.aud);
        return null;
      }
      if (payload.iss && payload.iss !== 'user-service') {
        console.warn('⚠️ Invalid token issuer:', payload.iss);
        return null;
      }

      // Extract user context from token
      const userContext: UserContext = {
        id: payload.userId || payload.id || '',
        email: payload.email || '',
        role: payload.role as 'STUDENT' | 'TEACHER' | 'ADMIN',
        firstName: payload.firstName,
        lastName: payload.lastName
      };

      // Validate required fields
      if (!userContext.id || !userContext.email || !userContext.role) {
        console.warn('⚠️ Invalid token payload - missing required fields');
        return null;
      }

      // Validate role
      const validRoles: string[] = ['STUDENT', 'TEACHER', 'ADMIN'];
      if (!validRoles.includes(userContext.role)) {
        console.warn('⚠️ Invalid role in token:', userContext.role);
        return null;
      }

      // Check token expiration (supports ISO string or numeric seconds/millis)
      if (payload.exp) {
        let expMs: number | null = null;
        if (typeof payload.exp === 'string') {
          const d = new Date(payload.exp);
          expMs = isNaN(d.getTime()) ? null : d.getTime();
        } else if (typeof payload.exp === 'number') {
          // Heuristic: values < 1e12 are likely seconds, convert to ms
          expMs = payload.exp < 1e12 ? payload.exp * 1000 : payload.exp;
        }
        if (expMs !== null && expMs < Date.now()) {
          console.warn('⚠️ Token has expired');
          return null;
        }
      }

      return userContext;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      return null;
    }
  }

  static extractTokenFromMessage(message: unknown): string | null {
    try {
      // Type guard for message structure
      if (typeof message !== 'object' || message === null) {
        return null;
      }

      const messageObj = message as Record<string, unknown>;

      // Token can be provided in authentication message
      if (messageObj.type === 'authenticate' && 
          typeof messageObj.data === 'object' && 
          messageObj.data !== null) {
        const authData = messageObj.data as Record<string, unknown>;
        if (typeof authData.token === 'string') {
          return authData.token;
        }
      }

      // Token can be provided in initial connection data
      if (typeof messageObj.token === 'string') {
        return messageObj.token;
      }

      return null;
    } catch (error) {
      console.error('❌ Error extracting token from message:', error);
      return null;
    }
  }

  static extractTokenFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url, 'http://localhost');
      const token = urlObj.searchParams.get('token');
      return token;
    } catch (error) {
      console.error('❌ Error extracting token from URL:', error);
      return null;
    }
  }

  static createMockUserContext(role: 'STUDENT' | 'TEACHER' | 'ADMIN' = 'STUDENT'): UserContext {
    return {
      id: `mock-user-${Date.now()}`,
      email: `mock.user@example.com`,
      role,
      firstName: 'Mock',
      lastName: 'User'
    };
  }
}