import { getPool } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { createCircuitBreaker } from '../utils/circuitBreaker.js';
import { whatsappQueue, addJob } from '../jobs/queue.js';

interface SendMessageOptions {
  customerId?: number;
  phone: string;
  templateName: string;
  variables: Record<string, string | number>;
}

export class WhatsappService {
  private client: Client | null = null;
  private isReady: boolean = false;
  private breaker: any;

  constructor() {
    // Inicializa o Circuit Breaker para o método de entrega
    this.breaker = createCircuitBreaker(this.deliverMessage.bind(this), 'WhatsApp-Delivery');

    // Fallback caso o circuito esteja aberto
    this.breaker.fallback(() => {
      logger.warn('WhatsApp Circuit is OPEN. Message skipped or queued for later.');
      throw new AppError('WhatsApp service is currently unavailable (Circuit Open)', 503);
    });
  }

  /**
   * Inicializa o cliente WhatsApp. Deve ser chamado uma vez no início da aplicação.
   */
  async initWhatsappClient(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      logger.info('WhatsApp Client initialization skipped in test environment.');
      return;
    }
    logger.info('Initializing WhatsApp Client...');
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: 'pdv-backend' }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    this.client.on('qr', (qr) => {
      logger.info('QR RECEIVED. Scan this QR code with your phone to authenticate WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('authenticated', () => {
      logger.info('WhatsApp Client AUTHENTICATED!');
    });

    this.client.on('auth_failure', (msg) => {
      logger.error('WHATSAPP AUTH FAILURE:', msg);
      this.isReady = false;
    });

    this.client.on('ready', () => {
      logger.info('WhatsApp Client is READY!');
      this.isReady = true;
    });

    this.client.on('message', async (msg) => {
      try {
        const text = msg.body.toLowerCase();
        if (text.includes('agendar')) {
          const { appointmentService } = await import('./appointmentService.js');
          const contact = await msg.getContact();
          const appointment = await appointmentService.bookAppointment(
            msg.from.replace('@c.us', ''),
            contact.pushname || 'Cliente',
            'Aparelho a definir',
          );

          await msg.reply(
            `Tudo certo! Agendamos seu atendimento para o dia ${appointment.date.toLocaleDateString('pt-BR')} às ${appointment.date.toLocaleTimeString('pt-BR')}. Sua pré-OS é a #${appointment.orderId}. Te esperamos! 📱🚀`,
          );
        }
      } catch (e) {
        logger.error('Error handling incoming message:', e);
      }
    });

    this.client.on('disconnected', (reason) => {
      logger.warn('WHATSAPP CLIENT DISCONNECTED:', reason);
      this.isReady = false;
    });

    await this.client.initialize().catch((err) => {
      logger.error('Failed to initialize WhatsApp Client:', err);
      this.isReady = false;
    });
  }

  /**
   * Envia uma mensagem baseada em template (enfileira para background).
   */
  async queueTemplateMessage(options: SendMessageOptions): Promise<void> {
    await addJob(whatsappQueue, 'sendTemplate', options);
  }

  /**
   * Envia uma mensagem baseada em template para um cliente (processamento imediato).
   */
  async sendTemplateMessage({
    customerId,
    phone,
    templateName,
    variables,
  }: SendMessageOptions): Promise<void> {
    const pool = getPool();
    const client = await pool.connect();
    let messageContent = `Template Error: ${templateName}`;

    try {
      const templateRes = await client.query(
        'SELECT content FROM whatsapp_templates WHERE name = $1 AND is_active = TRUE',
        [templateName],
      );

      if (templateRes.rowCount === 0) {
        logger.warn(
          `Whatsapp template '${templateName}' not found or inactive. Using default content.`,
        );
        messageContent = `[FALLBACK] Olá, sua notificação sobre ${templateName} está pronta!`;
      } else {
        messageContent = templateRes.rows[0].content;
        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          messageContent = messageContent.replace(regex, String(value));
        }
      }

      // Envia via Circuit Breaker
      await this.breaker.fire(phone, messageContent);

      await client.query(
        `INSERT INTO whatsapp_logs (customer_id, phone, content, status, sent_at)
         VALUES ($1, $2, $3, 'sent', NOW())`,
        [customerId, phone, messageContent],
      );

      logger.info(`Whatsapp message sent to ${phone} using template '${templateName}'`);
    } catch (error) {
      logger.error(`Failed to send whatsapp message to ${phone}:`, error);

      await client.query(
        `INSERT INTO whatsapp_logs (customer_id, phone, content, status, error_message)
         VALUES ($1, $2, $3, 'failed', $4)`,
        [customerId, phone, messageContent, (error as Error).message],
      );
    } finally {
      client.release();
    }
  }

  /**
   * Envia a mensagem usando o cliente whatsapp-web.js.
   */
  private async deliverMessage(phone: string, content: string): Promise<void> {
    if (!this.isReady || !this.client) {
      logger.warn('WhatsApp Client not ready. Message delivery skipped.');
      throw new AppError('WhatsApp Client is not ready or authenticated.', 503);
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('55')
        ? `${cleanPhone}@c.us`
        : `55${cleanPhone}@c.us`;

      await this.client.sendMessage(formattedPhone, content);
      logger.info(`[WHATSAPP_PROVIDER] Message sent to ${formattedPhone}: "${content}"`);
    } catch (error) {
      logger.error(`[WHATSAPP_PROVIDER] Error sending message to ${phone}:`, error);
      throw error;
    }
  }

  async upsertTemplate(name: string, content: string): Promise<void> {
    const pool = getPool();
    await pool.query(
      `INSERT INTO whatsapp_templates (name, content, is_active) 
       VALUES ($1, $2, TRUE)
       ON CONFLICT (name) DO UPDATE SET content = EXCLUDED.content, is_active = EXCLUDED.is_active, updated_at = NOW()`,
      [name, content],
    );
  }

  async getLogsByCustomer(customerId: number) {
    const pool = getPool();
    const res = await pool.query(
      'SELECT * FROM whatsapp_logs WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId],
    );
    return res.rows;
  }

  getBreakerStatus() {
    return {
      name: 'WhatsApp Delivery',
      opened: this.breaker.opened,
      halfOpen: this.breaker.halfOpen,
      closed: this.breaker.closed,
      stats: this.breaker.stats,
    };
  }
}

export const whatsappService = new WhatsappService();
export const initWhatsapp = () => whatsappService.initWhatsappClient();
