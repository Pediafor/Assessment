import { V4 } from 'paseto';

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
  private static publicKey: string = process.env.PASETO_PUBLIC_KEY || '';

  static async validateToken(token: string): Promise<UserContext | null> {
    try {
      if (!this.publicKey) {
        console.error('❌ PASETO_PUBLIC_KEY not configured');
        return null;
      }

      // Verify PASETO token
      const payload = await V4.verify(token, this.publicKey) as TokenPayload;
      
      if (!payload || typeof payload !== 'object') {
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

      // Check token expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.warn('⚠️ Token has expired');
        return null;
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