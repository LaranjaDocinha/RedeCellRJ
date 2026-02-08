import argon2 from 'argon2';
import bcrypt from 'bcrypt';
import pino from 'pino';

const logger = pino();

/**
 * Utilitário para gerenciamento de senhas com suporte a migração de bcrypt para argon2id.
 */
export const passwordUtils = {
  /**
   * Gera um hash para a senha usando Argon2id.
   * @param password Senha em texto puro
   */
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64MB
      timeCost: 3,
      parallelism: 1,
    });
  },

  /**
   * Verifica se a senha corresponde ao hash (suporta Argon2 e Bcrypt).
   * @param password Senha em texto puro
   * @param hash Hash armazenado no banco
   */
  async verify(password: string, hash: string): Promise<boolean> {
    if (!hash) return false;

    // Hashes do Argon2 geralmente começam com $argon2id$ ou $argon2i$
    if (hash.startsWith('$argon2')) {
      try {
        return await argon2.verify(hash, password);
      } catch (error) {
        logger.error({ error }, 'Erro ao verificar hash Argon2');
        return false;
      }
    }

    // Caso contrário, assume-se que é Bcrypt (ou legando)
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error({ error }, 'Erro ao verificar hash Bcrypt');
      return false;
    }
  },

  /**
   * Verifica se o hash precisa ser atualizado (se não for Argon2 ou se os parâmetros mudaram).
   * @param hash Hash atual
   */
  needsRehash(hash: string): boolean {
    // Se não começar com $argon2id$, precisa de rehash
    return !hash.startsWith('$argon2id$');
  },
};
