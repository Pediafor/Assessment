// Simple test to verify Jest setup
describe('Test Environment Setup', () => {
  it('should have correct environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.PASETO_PRIVATE_KEY).toBeDefined();
    expect(process.env.PASETO_PUBLIC_KEY).toBeDefined();
  });

  it('should be able to run basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toBe('hello');
    expect([1, 2, 3]).toHaveLength(3);
  });

  it('should handle async operations', async () => {
    const asyncOperation = async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('completed'), 10);
      });
    };

    const result = await asyncOperation();
    expect(result).toBe('completed');
  });
});

// Test for basic TypeScript and module resolution
describe('TypeScript and Modules', () => {
  it('should support ES6 imports and exports', () => {
    const testObject = { name: 'test', value: 42 };
    const { name, value } = testObject;
    
    expect(name).toBe('test');
    expect(value).toBe(42);
  });

  it('should support async/await syntax', async () => {
    const mockAsyncFunction = jest.fn().mockResolvedValue('mock result');
    
    const result = await mockAsyncFunction();
    
    expect(result).toBe('mock result');
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });

  it('should support Jest mocking', () => {
    const mockFunction = jest.fn();
    mockFunction.mockReturnValue('mocked');
    
    const result = mockFunction();
    
    expect(result).toBe('mocked');
    expect(mockFunction).toHaveBeenCalled();
  });
});