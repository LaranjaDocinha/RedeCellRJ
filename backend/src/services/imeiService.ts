import pool from '../db/index.js';
import { AppError } from '../utils/errors.js';
import { z } from 'zod';

interface ImeiEventPayload {
  imei: string;
  event_type: string;
  reference_id?: number;
  notes?: string;
}

export const imeiService = {
  /**
   * Registra um evento no ciclo de vida de um IMEI.
   * @param payload Dados do evento.
   * @returns O evento de IMEI registrado.
   */
  async recordImeiEvent(payload: ImeiEventPayload) {
    const { imei, event_type, reference_id, notes } = payload;
    const result = await pool.query(
      'INSERT INTO imei_lifecycle_events (imei, event_type, reference_id, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [imei, event_type, reference_id, notes],
    );
    return result.rows[0];
  },

  /**
   * Obtém todo o histórico de eventos para um IMEI específico.
   * @param imei O IMEI a ser consultado.
   * @returns Lista de eventos do ciclo de vida do IMEI.
   */
  async getImeiHistory(imei: string) {
    const result = await pool.query(
      'SELECT * FROM imei_lifecycle_events WHERE imei = $1 ORDER BY created_at ASC',
      [imei],
    );
    return result.rows;
  },
};
