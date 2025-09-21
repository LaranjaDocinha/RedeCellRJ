var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AppError } from '../utils/errors.js';
import nodemailer from 'nodemailer';
class EmailService {
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
    sendEmail(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: process.env.EMAIL_FROM || '"RedecellRJ POS" <noreply@redecellrj.com>',
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            };
            try {
                yield this.transporter.sendMail(mailOptions);
                console.log(`Email sent to ${options.to}`);
            }
            catch (error) {
                if (error instanceof AppError) {
                    throw error;
                }
                throw error;
            }
        });
    }
}
export const emailService = new EmailService();
