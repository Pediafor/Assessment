
import { registerUser } from '../../../src/services/user.service';
import prisma from '../../../src/prismaClient';
import { sendEmail } from '../../../src/utils/email';

// Mock prisma
jest.mock('../../../../src/prismaClient', () => ({
  user: {
    create: jest.fn(),
  },
}));

// Mock email
jest.mock('../../../../src/utils/email');

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a verification email on user registration', async () => {
    const userData = {
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
    };

    const createdUser = {
      ...userData,
      id: '1',
      role: 'STUDENT',
      isActive: true,
      emailVerificationToken: 'test-token',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

    await registerUser(userData);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining(userData),
    });

    expect(sendEmail).toHaveBeenCalledWith({
      to: userData.email,
      subject: 'Verify Your Email Address',
      text: expect.stringContaining('Please click this link to verify your email address'),
      html: expect.stringContaining('<p>Please click this link to verify your email address: <a href="'),
    });
  });
});
