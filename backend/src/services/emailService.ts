import { AppError } from '../utils/errors.js';
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter;

  constructor() {
    // Configure your email transporter
    // For development, you can use Mailtrap or Ethereal Email
    // For production, use a service like SendGrid, Mailgun, AWS SES, etc.
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"RedecellRJ POS" <noreply@redecellrj.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${options.to}`);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }
      throw error;
    }
  }
}

export const emailService = new EmailService();