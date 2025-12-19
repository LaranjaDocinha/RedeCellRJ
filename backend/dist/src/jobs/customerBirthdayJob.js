import cron from 'node-cron';
import { customerService } from '../services/customerService.js';
import { templateService } from '../services/templateService.js';
import { emailService } from '../services/emailService.js';
const NOTIFICATIONS_MICROSERVICE_URL = process.env.NOTIFICATIONS_MICROSERVICE_URL || 'http://localhost:3002';
/**
 * Checks for customer birthdays and sends a notification to sellers.
 */
export const customerBirthdayJob = async () => {
    try {
        const today = new Date();
        const customers = await customerService.getCustomersWithBirthdayToday();
        for (const customer of customers) {
            // Send email to customer
            const emailTemplate = await templateService.getTemplateByName('customer_birthday_email');
            if (emailTemplate && customer.email) {
                const subject = emailTemplate.subject.replace('{{customerName}}', customer.name);
                const body = emailTemplate.body.replace('{{customerName}}', customer.name);
                await emailService.sendEmail(customer.email, subject, body);
            }
            // Emit in-app notification to relevant sellers/admins via microservice
            const notificationData = {
                message: `Aniversário do cliente ${customer.name} hoje!`,
                customer_id: customer.id,
                type: 'birthday_alert',
            };
            await fetch(`${NOTIFICATIONS_MICROSERVICE_URL}/send/in-app`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: notificationData.message, type: notificationData.type }),
            });
        }
        console.log(`Customer birthday job ran. Found ${customers.length} birthdays.`);
    }
    catch (error) {
        console.error('Error in customer birthday job:', error);
    }
};
/**
 * Schedules the Customer Birthday Check job to run daily.
 */
export const scheduleCustomerBirthdayJob = () => {
    // Schedule to run at 8:00 AM every day
    cron.schedule('0 8 * * *', async () => {
        console.log('Running daily customer birthday check...');
        await customerBirthdayJob();
    }, {
        timezone: 'America/Sao_Paulo',
    });
};
