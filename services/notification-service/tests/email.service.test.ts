import { transporter, sendEmail } from '../src/services/email.service';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id', response: '250 OK' })
    })),
  },
}));

describe('email.service', () => {
  it('sends email with given options', async () => {
    const info = await sendEmail({
      to: 'student@example.com',
      subject: 'Test',
      text: 'hello',
      html: '<p>hello</p>',
    });
    expect(info).toBeDefined();
  });
});
