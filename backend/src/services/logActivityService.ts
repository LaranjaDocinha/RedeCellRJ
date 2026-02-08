import { getPool } from '../db/index.js';

interface LogActivityOptions {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

class LogActivityService {
  /**
   * Calcula a diferença entre dois objetos para auditoria.
   */
  private calculateDiff(oldObj: any, newObj: any) {
    if (!oldObj) return { added: newObj };
    if (!newObj) return { removed: oldObj };

    const diff: any = {};
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      if (['updated_at', 'created_at', 'password_hash'].includes(key)) continue;

      if (oldObj[key] !== newObj[key]) {
        diff[key] = {
          from: oldObj[key],
          to: newObj[key],
        };
      }
    }
    return Object.keys(diff).length > 0 ? diff : null;
  }

  async logActivity(options: LogActivityOptions): Promise<void> {
    const { userId, action, resourceType, resourceId, oldValue, newValue, ipAddress } = options;
    const pool = getPool();

    const diff = this.calculateDiff(oldValue, newValue);

    // Se não houve mudança real e o objetivo era auditar mudança de estado, podemos pular ou logar apenas a ação
    if (oldValue && newValue && !diff) {
      return;
    }

    const details = {
      diff,
      // Guardamos os valores completos apenas se necessário, o diff é mais eficiente para o Log 2.0
      ...(oldValue && !newValue ? { removedData: oldValue } : {}),
      ...(newValue && !oldValue ? { addedData: newValue } : {}),
    };

    try {
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          action,
          resourceType,
          // Tentamos converter para UUID se possível, senão guardamos no JSON
          resourceId && resourceId.length === 36 ? resourceId : null,
          JSON.stringify(details),
          ipAddress,
        ],
      );
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export const logActivityService = new LogActivityService();
