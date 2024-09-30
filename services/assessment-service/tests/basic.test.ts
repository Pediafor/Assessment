describe('Basic Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should have test utils available', () => {
    expect((global as any).testUtils).toBeDefined();
    expect((global as any).testUtils.createMockTeacher).toBeDefined();
  });
});