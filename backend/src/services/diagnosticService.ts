import { getPool } from '../db/index.js';
import { AppError } from '../utils/errors.js';

interface DiagnosticNode {
  id: number;
  question_text: string;
  is_solution: boolean;
  solution_details: string | null;
  parent_node_id: number | null;
}

interface DiagnosticNodeOption {
  id: number;
  diagnostic_node_id: number;
  option_text: string;
  next_node_id: number | null;
}

class DiagnosticService {
  async getRootNodes(): Promise<DiagnosticNode[]> {
    const pool = getPool();
    try {
      const { rows } = await pool.query(
        `SELECT id, question_text, is_solution, solution_details, parent_node_id
         FROM diagnostic_nodes
         WHERE parent_node_id IS NULL
         ORDER BY question_text`,
      );
      return rows;
    } catch (error) {
      console.error('Error fetching root diagnostic nodes:', error);
      throw new AppError('Failed to fetch root diagnostic nodes', 500);
    }
  }

  async getChildNodes(nodeId: number): Promise<DiagnosticNode[]> {
    const pool = getPool();
    try {
      const { rows } = await pool.query(
        `SELECT id, question_text, is_solution, solution_details, parent_node_id
         FROM diagnostic_nodes
         WHERE parent_node_id = $1
         ORDER BY question_text`,
        [nodeId],
      );
      return rows;
    } catch (error) {
      console.error(`Error fetching child diagnostic nodes for ${nodeId}:`, error);
      throw new AppError('Failed to fetch child diagnostic nodes', 500);
    }
  }

  async getNodeOptions(nodeId: number): Promise<DiagnosticNodeOption[]> {
    const pool = getPool();
    try {
      const { rows } = await pool.query(
        `SELECT id, diagnostic_node_id, option_text, next_node_id
         FROM diagnostic_node_options
         WHERE diagnostic_node_id = $1
         ORDER BY option_text`,
        [nodeId],
      );
      return rows;
    } catch (error) {
      console.error(`Error fetching options for diagnostic node ${nodeId}:`, error);
      throw new AppError('Failed to fetch diagnostic node options', 500);
    }
  }

  async submitFeedback(
    nodeId: number,
    userId: string | undefined,
    isHelpful: boolean,
    comments: string | undefined,
  ): Promise<void> {
    const pool = getPool();
    try {
      await pool.query(
        `INSERT INTO diagnostic_feedback (node_id, user_id, is_helpful, comments)
         VALUES ($1, $2, $3, $4)`,
        [nodeId, userId, isHelpful, comments],
      );
    } catch (error) {
      console.error(`Error submitting feedback for node ${nodeId}:`, error);
      throw new AppError('Failed to submit feedback', 500);
    }
  }

  async recordHistory(
    userId: string | undefined,
    sessionId: string,
    nodeId: number,
    selectedOptionId: number | undefined,
  ): Promise<void> {
    const pool = getPool();
    try {
      await pool.query(
        `INSERT INTO diagnostic_history (user_id, session_id, node_id, selected_option_id)
         VALUES ($1, $2, $3, $4)`,
        [userId, sessionId, nodeId, selectedOptionId],
      );
    } catch (error) {
      console.error(`Error recording diagnostic history for session ${sessionId}:`, error);
      throw new AppError('Failed to record diagnostic history', 500);
    }
  }
}

export const diagnosticService = new DiagnosticService();
