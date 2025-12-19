import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhatsappService } from '../../../src/services/whatsappService.js';
import { getPool } from '../../../src/db/index.js'; // getPool é exportado nomeadamente
import { AppError } from '../../../src/utils/errors.js';
import { logger } from '../../../src/utils/logger.js';
import { Client, LocalAuth, Message } from 'whatsapp-web.js'; // Importações reais para tipos

// Mocks
vi.mock('../../../src/db/index.js', () => ({
  getPool: vi.fn(),
}));

// Mock do whatsapp-web.js. É crucial que o Client mockado retorne uma instância com métodos "on" e "initialize"
const mockClientInstance = {
  on: vi.fn(),
  initialize: vi.fn(),
  sendMessage: vi.fn(),
};
// Garante que 'on' retorna a própria instância para permitir encadeamento
mockClientInstance.on.mockReturnThis();

vi.mock('whatsapp-web.js', () => ({
  Client: vi.fn(() => mockClientInstance),
  LocalAuth: vi.fn(),
}));

vi.mock('qrcode-terminal', () => ({
  generate: vi.fn(),
}));
vi.mock('../../../src/utils/logger.js', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));


describe('WhatsappService', () => {
  let service: WhatsappService;
  let mockPool: any;
  let mockPgClient: any;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalNodeEnv = process.env.NODE_ENV; // Salva o NODE_ENV original

    mockPgClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    mockPool = {
      connect: vi.fn().mockResolvedValue(mockPgClient),
      query: vi.fn(), // Para upsertTemplate e getLogsByCustomer
    };
    (getPool as vi.Mock).mockReturnValue(mockPool);

    // Reinicia o serviço para cada teste, garantindo um novo client mockado
    service = new WhatsappService();
    
    // Garante que o cliente mockado é injetado no serviço
    (service as any).client = mockClientInstance; 
    (service as any).isReady = false; // Reseta o estado
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv; // Restaura o NODE_ENV
  });

  describe('initWhatsappClient', () => {
    it('deve pular a inicialização em ambiente de teste', async () => {
      process.env.NODE_ENV = 'test';
      await service.initWhatsappClient();

      expect(logger.info).toHaveBeenCalledWith('WhatsApp Client initialization skipped in test environment.');
      expect(Client).not.toHaveBeenCalled();
      expect(mockClientInstance.initialize).not.toHaveBeenCalled();
    });

    it('deve inicializar o cliente em ambiente de não-teste', async () => {
      process.env.NODE_ENV = 'development'; // Ou 'production'
      mockClientInstance.initialize.mockResolvedValueOnce(undefined);

      await service.initWhatsappClient();

      expect(logger.info).toHaveBeenCalledWith('Initializing WhatsApp Client...');
      expect(Client).toHaveBeenCalledWith(expect.any(Object));
      expect(mockClientInstance.on).toHaveBeenCalledWith('qr', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('authenticated', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('auth_failure', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
      expect(mockClientInstance.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockClientInstance.initialize).toHaveBeenCalled();
    });

    it('deve logar erro se a inicialização do cliente falhar', async () => {
      process.env.NODE_ENV = 'development';
      const initError = new Error('Init failed');
      mockClientInstance.initialize.mockRejectedValueOnce(initError);

      await service.initWhatsappClient();

      expect(logger.error).toHaveBeenCalledWith('Failed to initialize WhatsApp Client:', initError);
      expect((service as any).isReady).toBe(false);
    });

    it('deve setar isReady para true quando o cliente estiver pronto', async () => {
      process.env.NODE_ENV = 'development';
      mockClientInstance.initialize.mockResolvedValueOnce(undefined);

      await service.initWhatsappClient();
      const readyCallback = mockClientInstance.on.mock.calls.find(call => call[0] === 'ready')[1];
      readyCallback();

      expect(logger.info).toHaveBeenCalledWith('WhatsApp Client is READY!');
      expect((service as any).isReady).toBe(true);
    });

    it('deve setar isReady para false em auth_failure', async () => {
      process.env.NODE_ENV = 'development';
      mockClientInstance.initialize.mockResolvedValueOnce(undefined);

      await service.initWhatsappClient();
      const authFailureCallback = mockClientInstance.on.mock.calls.find(call => call[0] === 'auth_failure')[1];
      authFailureCallback('Auth failed message');

      expect(logger.error).toHaveBeenCalledWith('WHATSAPP AUTH FAILURE:', 'Auth failed message');
      expect((service as any).isReady).toBe(false);
    });

    it('deve setar isReady para false em disconnected', async () => {
      process.env.NODE_ENV = 'development';
      mockClientInstance.initialize.mockResolvedValueOnce(undefined);

      await service.initWhatsappClient();
      const disconnectedCallback = mockClientInstance.on.mock.calls.find(call => call[0] === 'disconnected')[1];
      disconnectedCallback('Network issues');

      expect(logger.warn).toHaveBeenCalledWith('WHATSAPP CLIENT DISCONNECTED:', 'Network issues');
      expect((service as any).isReady).toBe(false);
    });
  });

  describe('sendTemplateMessage', () => {
    it('deve enviar mensagem de template e logar sucesso', async () => {
      (service as any).isReady = true; // Cliente pronto
      mockPgClient.query.mockResolvedValueOnce({ rows: [{ content: 'Olá {{name}}!' }], rowCount: 1 }); // Template encontrado
      vi.spyOn(service as any, 'deliverMessage').mockResolvedValueOnce(undefined); // Mockar o envio

      await service.sendTemplateMessage({
        customerId: 1,
        phone: '11987654321',
        templateName: 'welcome',
        variables: { name: 'João' },
      });

      expect(mockPgClient.query).toHaveBeenCalledWith(
        'SELECT content FROM whatsapp_templates WHERE name = $1 AND is_active = TRUE',
        ['welcome']
      );
      expect(service['deliverMessage']).toHaveBeenCalledWith('11987654321', 'Olá João!');
      expect(mockPgClient.query).toHaveBeenCalledWith(
        `INSERT INTO whatsapp_logs (customer_id, phone, content, status, sent_at)
         VALUES ($1, $2, $3, 'sent', NOW())`,
        [1, '11987654321', 'Olá João!']
      );
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Whatsapp message sent'));
      expect(mockPgClient.release).toHaveBeenCalled();
    });

    it('deve usar conteúdo fallback se template não encontrado e logar sucesso', async () => {
      (service as any).isReady = true; // Cliente pronto
      mockPgClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Template NÃO encontrado
      vi.spyOn(service as any, 'deliverMessage').mockResolvedValueOnce(undefined);

      await service.sendTemplateMessage({
        customerId: 1,
        phone: '11987654321',
        templateName: 'unknown_template',
        variables: {},
      });

      expect(mockPgClient.query).toHaveBeenCalledWith(
        'SELECT content FROM whatsapp_templates WHERE name = $1 AND is_active = TRUE',
        ['unknown_template']
      );
      expect(service['deliverMessage']).toHaveBeenCalledWith(
        '11987654321',
        expect.stringContaining('[FALLBACK] Olá, sua notificação sobre unknown_template está pronta!')
      );
      expect(mockPgClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO whatsapp_logs'),
        [1, '11987654321', expect.stringContaining('[FALLBACK]')]
      );
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('not found or inactive'));
      expect(mockPgClient.release).toHaveBeenCalled();
    });

    it('deve logar erro no DB se o envio da mensagem falhar', async () => {
      (service as any).isReady = true;
      mockPgClient.query.mockResolvedValueOnce({ rows: [{ content: 'Test' }], rowCount: 1 });
      const deliveryError = new Error('Failed to deliver');
      vi.spyOn(service as any, 'deliverMessage').mockRejectedValueOnce(deliveryError);

      await service.sendTemplateMessage({
        customerId: 1,
        phone: '11987654321',
        templateName: 'test',
        variables: {},
      });

      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send whatsapp message'), deliveryError);
      expect(mockPgClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO whatsapp_logs'),
        [1, '11987654321', 'Test', deliveryError.message]
      );
      expect(mockPgClient.release).toHaveBeenCalled();
    });

    it('deve logar erro no DB se a busca do template falhar', async () => {
        (service as any).isReady = true;
        const dbFetchError = new Error('DB Fetch Error');
        mockPgClient.query.mockRejectedValueOnce(dbFetchError); // Simula erro na busca do template
        
        await service.sendTemplateMessage({
            customerId: 1,
            phone: '11987654321',
            templateName: 'error_template',
            variables: {},
        });

        expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to send whatsapp message'), dbFetchError);
        expect(mockPgClient.query).toHaveBeenCalledWith( // Deveria tentar logar o erro
            expect.stringContaining('INSERT INTO whatsapp_logs'),
            [1, '11987654321', expect.stringContaining('Template Error'), dbFetchError.message]
        );
        expect(mockPgClient.release).toHaveBeenCalled();
    });
  });

  describe('deliverMessage', () => {
    it('deve lançar AppError se o cliente não estiver pronto', async () => {
      (service as any).isReady = false;
      await expect(service['deliverMessage']('11987654321', 'Test')).rejects.toThrow(
        'WhatsApp Client is not ready or authenticated.'
      );
      expect(logger.warn).toHaveBeenCalledWith('WhatsApp Client not ready. Message delivery skipped.');
      expect(mockClientInstance.sendMessage).not.toHaveBeenCalled();
    });

    it('deve formatar o telefone e enviar a mensagem', async () => {
      (service as any).isReady = true;
      (service as any).client = mockClientInstance; // Garante que o client está configurado
      mockClientInstance.sendMessage.mockResolvedValueOnce(undefined);

      await service['deliverMessage']('  +55 (11) 98765-4321 ', 'Hello');

      expect(mockClientInstance.sendMessage).toHaveBeenCalledWith('5511987654321@c.us', 'Hello');
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('[WHATSAPP_PROVIDER] Message sent'));
    });

    it('deve relançar erro se sendMessage falhar', async () => {
      (service as any).isReady = true;
      (service as any).client = mockClientInstance;
      const sendError = new Error('Send failed');
      mockClientInstance.sendMessage.mockRejectedValueOnce(sendError);

      await expect(service['deliverMessage']('11987654321', 'Hello')).rejects.toThrow(sendError);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('[WHATSAPP_PROVIDER] Error sending message'), sendError);
    });
  });

  describe('upsertTemplate', () => {
    it('deve inserir um novo template', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      await service.upsertTemplate('new_template', 'Conteúdo do novo template');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO whatsapp_templates'),
        ['new_template', 'Conteúdo do novo template']
      );
    });

    it('deve atualizar um template existente', async () => {
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      await service.upsertTemplate('existing_template', 'Conteúdo atualizado');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT (name) DO UPDATE SET'),
        ['existing_template', 'Conteúdo atualizado']
      );
    });
  });

  describe('getLogsByCustomer', () => {
    it('deve retornar logs de mensagens para um cliente', async () => {
      const mockLogs = [{ id: 1, customer_id: 1, content: 'Log1' }];
      mockPool.query.mockResolvedValueOnce({ rows: mockLogs });

      const logs = await service.getLogsByCustomer(1);

      expect(logs).toEqual(mockLogs);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM whatsapp_logs WHERE customer_id = $1 ORDER BY created_at DESC',
        [1]
      );
    });

    it('deve retornar array vazio se não houver logs', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const logs = await service.getLogsByCustomer(999);

      expect(logs).toEqual([]);
    });
  });
});
