import { auditRepository } from '../repositories/audit.repository.js';
import { getContext } from './context.js';
import { logger } from './logger.js';
import { PoolClient } from 'pg';

/**
 * Utilitário de alto nível para auditoria sistêmica (Time Travel).
 */
export const auditLogger = {
  /**
   * Registra uma ação de criação.
   */
  async logCreate(
    entityType: string,
    entityId: string | number,
    newData: any,
    client?: PoolClient,
    details?: any,
  ) {
    const ctx = getContext();

    await auditRepository.create(
      {
        user_id: ctx?.userId,
        action: 'CREATE',
        entity_type: entityType,
        entity_id: String(entityId),
        new_values: newData,
        details,
        ip_address: ctx?.ip,
        user_agent: ctx?.userAgent,
      },
      client,
    );

    logger.debug(`Audit: Created ${entityType} #${entityId}`);
  },

  /**
   * Registra uma ação de atualização com comparação de estados.
   */
  async logUpdate(
    entityType: string,
    entityId: string | number,
    oldData: any,
    newData: any,
    client?: PoolClient,
    details?: any,
  ) {
    const ctx = getContext();

    // Filtra apenas o que mudou para não poluir o banco (opcional, mas recomendado)
    const changes: any = {};
    let hasChanges = false;

    for (const key in newData) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = newData[key];
        hasChanges = true;
      }
    }

    if (!hasChanges && !details) return;

    await auditRepository.create(
      {
        user_id: ctx?.userId,
        action: 'UPDATE',
        entity_type: entityType,
        entity_id: String(entityId),
        old_values: oldData,
        new_values: newData,
        details: { ...details, changed_fields: Object.keys(changes) },
        ip_address: ctx?.ip,
        user_agent: ctx?.userAgent,
      },
      client,
    );

    logger.debug(`Audit: Updated ${entityType} #${entityId}`);
  },

  /**
   * Registra uma ação de deleção.
   */
  async logDelete(
    entityType: string,
    entityId: string | number,
    oldData: any,
    client?: PoolClient,
    details?: any,
  ) {
    const ctx = getContext();

    await auditRepository.create(
      {
        user_id: ctx?.userId,
        action: 'DELETE',
        entity_type: entityType,
        entity_id: String(entityId),
        old_values: oldData,
        details,
        ip_address: ctx?.ip,
        user_agent: ctx?.userAgent,
      },
      client,
    );

    logger.debug(`Audit: Deleted ${entityType} #${entityId}`);
  },

  /**
   * Alias for logUpdate to support legacy calls.
   */
  async logChange(
    entityType: string,
    entityId: string | number,
    userId: string,
    oldData: any,
    newData: any,
    client?: PoolClient,
  ) {
    return this.logUpdate(entityType, entityId, oldData, newData, client, { userId });
  },
};
