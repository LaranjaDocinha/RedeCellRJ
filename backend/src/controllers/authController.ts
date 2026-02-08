import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.register(
        name,
        email,
        password,
        'employee',
      );

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, { user, accessToken }, 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for']?.toString();
      const userAgent = req.get('user-agent');

      const { user, accessToken, refreshToken } = await authService.login(
        email,
        password,
        ip,
        userAgent,
      );

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      logger.info(`User logged in: ${email}`);
      return sendSuccess(res, { user, accessToken });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'Refresh token missing', 'UNAUTHENTICATED', 401);
      }

      const { accessToken } = await authService.refreshAccessToken(refreshToken);
      return sendSuccess(res, { accessToken });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.requestPasswordReset(req.body.email);
      return sendSuccess(res, {
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
