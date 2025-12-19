import { customerService } from './customerService.js';
import { customerCommunicationService } from './customerCommunicationService.js';

class EmailService {
  private NOTIFICATIONS_MICROSERVICE_URL =
    process.env.NOTIFICATIONS_MICROSERVICE_URL || 'http://localhost:3002';

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    try {
      const response = await fetch(`${this.NOTIFICATIONS_MICROSERVICE_URL}/send/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, text: body }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email via microservice');
      }

      console.log('Email sent via microservice successfully');

      // Log the communication
      const customer = await customerService.getCustomerByEmail(to);
      if (customer) {
        await customerCommunicationService.recordCommunication({
          customer_id: customer.id,
          channel: 'email',
          direction: 'outbound',
          summary: subject,
        });
      }
    } catch (error) {
      console.error('Error sending email or logging communication:', error);
      throw new Error('Failed to send email');
    }
  }
}

export const emailService = new EmailService();
