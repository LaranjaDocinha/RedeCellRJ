import { getPool } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import type { Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal'; // Para exibir o QR Code no terminal

interface SendMessageOptions {
  customerId?: number;
  phone: string;
  templateName: string;
  variables: Record<string, string | number>;
}

export class WhatsappService {
  private client: Client | null = null; // Cliente do WhatsApp
  private isReady: boolean = false; // Flag para indicar se o cliente está pronto

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
      authStrategy: new LocalAuth({ clientId: 'pdv-backend' }), // Armazena a sessão localmente com um ID
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Args para compatibilidade em alguns ambientes
        // headless: false, // Opcional: para ver o navegador Chromium
      },
    });

    this.client.on('qr', (qr) => {
      logger.info('QR RECEIVED. Scan this QR code with your phone to authenticate WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('authenticated', (session) => {
      logger.info('WhatsApp Client AUTHENTICATED!');
      // session saved
    });

    this.client.on('auth_failure', (msg) => {
      logger.error('WHATSAPP AUTH FAILURE:', msg);
      this.isReady = false;
    });

    this.client.on('ready', () => {
      logger.info('WhatsApp Client is READY!');
      this.isReady = true;
    });

    this.client.on('disconnected', (reason) => {
      logger.warn('WHATSAPP CLIENT DISCONNECTED:', reason);
      this.isReady = false;
      // Implementar lógica de reconexão ou notificação
      // Ex: this.client?.initialize();
    });

    this.client.on('message', (message: Message) => {
        // Exemplo de como lidar com mensagens recebidas (futuro)
        // if (message.body === '!ping') {
        //     message.reply('pong');
        // }
    });

    await this.client.initialize().catch(err => {
      logger.error('Failed to initialize WhatsApp Client:', err);
      this.isReady = false;
    });
  }

  /**
   * Envia uma mensagem baseada em template para um cliente.
   */
  async sendTemplateMessage({ customerId, phone, templateName, variables }: SendMessageOptions): Promise<void> {
    const pool = getPool();
    const client = await pool.connect();
    let messageContent = `Template Error: ${templateName}`; // Conteúdo padrão em caso de falha

    try {
      // 1. Buscar o template
      const templateRes = await client.query(
        'SELECT content FROM whatsapp_templates WHERE name = $1 AND is_active = TRUE',
        [templateName]
      );

      if (templateRes.rowCount === 0) {
        logger.warn(`Whatsapp template '${templateName}' not found or inactive. Using default content.`);
        // Fallback content or throw specific error
        messageContent = `[FALLBACK] Olá, sua notificação sobre ${templateName} está pronta!`;
      } else {
        messageContent = templateRes.rows[0].content;
        // 2. Substituir variáveis (Ex: {{name}} -> 'João')
        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          messageContent = messageContent.replace(regex, String(value));
        }
      }

      // 3. Enviar mensagem via WhatsApp-Web.js
      await this.deliverMessage(phone, messageContent);

      // 4. Logar no banco com status 'sent'
      await client.query(
        `INSERT INTO whatsapp_logs (customer_id, phone, content, status, sent_at)
         VALUES ($1, $2, $3, 'sent', NOW())`,
        [customerId, phone, messageContent]
      );

      logger.info(`Whatsapp message sent to ${phone} using template '${templateName}'`);

    } catch (error) {
      logger.error(`Failed to send whatsapp message to ${phone}:`, error);
      
      // Logar erro no banco com status 'failed'
      await client.query(
        `INSERT INTO whatsapp_logs (customer_id, phone, content, status, error_message)
         VALUES ($1, $2, $3, 'failed', $4)`,
        [customerId, phone, messageContent, (error as Error).message] // Usa messageContent que foi formatado
      );
      
      // Não relançamos o erro para não quebrar o fluxo principal (ex: venda),
      // mas podemos logar um AppError interno para ser tratado, se necessário.
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
      // O whatsapp-web.js requer que o número inclua o código do país (ex: 5511999999999)
      // Ajuste para garantir que o telefone esteja no formato correto (apenas números + código do país)
      // Ex: Remover caracteres não numéricos e adicionar 55 se não tiver
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('55') ? `${cleanPhone}@c.us` : `55${cleanPhone}@c.us`; // Assumindo Brasil

      await this.client.sendMessage(formattedPhone, content);
      logger.info(`[WHATSAPP_PROVIDER] Message sent to ${formattedPhone}: "${content}"`);
    } catch (error) {
      logger.error(`[WHATSAPP_PROVIDER] Error sending message to ${phone}:`, error);
      throw error; // Re-lança para ser capturado pelo bloco catch principal
    }
  }

  /**
   * Cria ou atualiza um template.
   */
  async upsertTemplate(name: string, content: string): Promise<void> {
    const pool = getPool();
    await pool.query(
      `INSERT INTO whatsapp_templates (name, content, is_active) 
       VALUES ($1, $2, TRUE)
       ON CONFLICT (name) DO UPDATE SET content = EXCLUDED.content, is_active = EXCLUDED.is_active, updated_at = NOW()`,
      [name, content]
    );
  }

  /**
   * Busca o histórico de mensagens de um cliente.
   */
  async getLogsByCustomer(customerId: number) {
    const pool = getPool();
    const res = await pool.query(
      'SELECT * FROM whatsapp_logs WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    return res.rows;
  }
}

export const whatsappService = new WhatsappService();
// Exportar a função de inicialização para ser chamada no app.ts
export const initWhatsapp = () => whatsappService.initWhatsappClient();
