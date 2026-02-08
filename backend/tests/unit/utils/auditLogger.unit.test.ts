import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditLogger } from '../../../src/utils/auditLogger.js';
import { auditRepository } from '../../../src/repositories/audit.repository.js';
import * as contextModule from '../../../src/utils/context.js';

describe('AuditLogger Utilitário', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Espionar a instância exportada diretamente
    vi.spyOn(auditRepository, 'create').mockResolvedValue(undefined);
  });

  it('deve chamar auditRepository.create ao logar criação', async () => {
    vi.spyOn(contextModule, 'getContext').mockReturnValue({
      userId: 'u1',
      ip: '1.1.1.1',
      userAgent: 'test',
      requestId: 'r1',
    } as any);

    await auditLogger.logCreate('Test', 1, { name: 'New' });

    expect(auditRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entity_type: 'Test',
        entity_id: '1',
        new_values: { name: 'New' },
        user_id: 'u1',
        ip_address: '1.1.1.1',
        user_agent: 'test',
      }),
      undefined,
    );
  });

  it('deve chamar auditRepository.create ao logar atualização', async () => {
    vi.spyOn(contextModule, 'getContext').mockReturnValue({
      userId: 'u1',
      ip: '1.1.1.1',
      userAgent: 'test',
      requestId: 'r1',
    } as any);

    await auditLogger.logUpdate('Test', 1, { name: 'Old' }, { name: 'New' });

    expect(auditRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE',
        old_values: { name: 'Old' },
        new_values: { name: 'New' },
        details: expect.objectContaining({ changed_fields: ['name'] }),
      }),
      undefined,
    );
  });

  it('não deve logar atualização se nada mudou e não há detalhes', async () => {
    await auditLogger.logUpdate('Test', 1, { a: 1 }, { a: 1 });
    expect(auditRepository.create).not.toHaveBeenCalled();
  });

  it('deve logar atualização se houver detalhes mesmo sem mudanças nos dados', async () => {
    await auditLogger.logUpdate('Test', 1, { a: 1 }, { a: 1 }, undefined, { force: true });
    expect(auditRepository.create).toHaveBeenCalled();
  });

  it('deve chamar auditRepository.create ao logar deleção', async () => {
    await auditLogger.logDelete('Test', 1, { id: 1 });
    expect(auditRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DELETE', entity_id: '1' }),
      undefined
    );
  });

  it('deve suportar alias logChange', async () => {
    const spy = vi.spyOn(auditLogger, 'logUpdate').mockResolvedValue(undefined);
    await auditLogger.logChange('Test', 1, 'user1', { a: 1 }, { a: 2 });
    expect(spy).toHaveBeenCalled();
  });
});
