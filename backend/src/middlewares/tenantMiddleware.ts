import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../utils/errors';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;

  if (!user) {
    return next(new AuthenticationError('User context missing for tenant validation'));
  }

  // No Redecell, o 'tenant' pode ser mapeado inicialmente para o 'branch_id'
  // ou uma nova coluna 'tenant_id' se o sistema for escalado para várias empresas independentes.
  // Aqui, garantimos que o ID está presente no objeto de request para ser usado pelos repositories.

  req.tenantId = user.tenant_id || user.branch_id || 1;

  next();
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenantId: string | number;
    }
  }
}
