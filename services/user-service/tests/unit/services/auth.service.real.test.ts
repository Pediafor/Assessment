
import { initiatePasswordReset } from '../../../src/services/auth.service';
import { getUserByEmail, storePasswordResetToken } from '../../../src/services/user.service';
import { sendEmail } from '../../../src/utils/email';

// Mock user service
jest.mock('../../../../src/services/user.service', () => ({
  getUserByEmail: jest.fn(),
  storePasswordResetToken: jest.fn(),
}));

// Mock email
jest.mock('../../../../src/utils/email');

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a password reset email', async () => {
    const email = 'test@example.com';
    const user = {
      id: '1',
      email,
      passwordHash: 'hashedpassword',
    };

    (getUserByEmail as jest.Mock).mockResolvedValue(user);

    await initiatePasswordReset(email);

    expect(getUserByEmail).toHaveBeenCalledWith(email);
    expect(storePasswordResetToken).toHaveBeenCalledWith(user.id, expect.any(String), expect.any(Date));
    expect(sendEmail).toHaveBeenCalledWith({
      to: email,
      subject: 'Password Reset Request',
      text: expect.stringContaining('Please click this link to reset your password'),
      html: expect.stringContaining('<p>Please click this link to reset your password: <a href="'),
    });
  });
});
