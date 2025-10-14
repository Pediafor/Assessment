
import { sendEmail } from '../../src/utils/email';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('Email Service', () => {
  it('should send an email', async () => {
    const sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: sendMailMock });

    const options = {
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Text',
      html: '<p>Test HTML</p>',
    };

    await sendEmail(options);

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  });
});
