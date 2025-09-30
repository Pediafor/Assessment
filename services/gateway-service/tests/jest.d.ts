// Global Jest types for TypeScript
import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toHaveProperty(keyPath: string, value?: any): R;
    }
  }
}

export {};