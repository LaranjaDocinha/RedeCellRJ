import { AppError } from '../utils/errors.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { emailService } from './emailService.js';
import { logActivityService } from './logActivityService.js';
import crypto from 'crypto';
import { userRepository, Permission } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { logger } from '../utils/logger.js';
import { passwordUtils } from '../utils/passwordUtils.js';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  permissions: Permission[];
  ip?: string;
  ua?: string; // User-Agent
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export const authService = {
  generateAccessToken(payload: JwtPayload) {
    return sign(payload, JWT_SECRET, { expiresIn: '15m' }); // Curto tempo de vida para o Access Token
  },

  async generateRefreshToken(userId: string) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await refreshTokenRepository.create(userId, token, expiresAt);
    return token;
  },

  async register(name: string, email: string, password: string, roleName: string = 'employee') {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const hashedPassword = await passwordUtils.hash(password);

    // Create user
    const newUser = await userRepository.create({
      name,
      email,
      password_hash: hashedPassword,
    });

    // Assign role
    try {
      await userRepository.assignRole(newUser.id, roleName);
    } catch (_error) {
      // Rollback user creation if role assignment fails (manual rollback as this service doesn't manage its own transaction here)
      // In a better design, this would be wrapped in a transaction
      await userRepository.delete(newUser.id);
      throw new AppError(`Role '${roleName}' not found or could not be assigned.`, 400);
    }

    const permissions = await userRepository.getUserPermissions(newUser.id);
    const payload: JwtPayload = {
      id: newUser.id,
      email: newUser.email,
      role: roleName,
      permissions,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(newUser.id);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: roleName,
        permissions,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    logger.info({ email, ip }, `Login attempt`);

    // Usamos o método especial que traz o password_hash
    const user = await userRepository.findWithPasswordByEmail(email);

    if (!user) {
      logger.warn(`Login failed: User ${email} not found.`);
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.password_hash) {
      logger.error(`Login failed: User ${email} has no password hash set.`);
      throw new AppError('Invalid credentials', 401);
    }

    // Modernização de segurança: Brute Force Protection
    if (
      user.failed_login_attempts >= 5 &&
      user.last_login &&
      new Date().getTime() - new Date(user.last_login).getTime() < 15 * 60 * 1000
    ) {
      throw new AppError('Account temporarily locked. Please try again in 15 minutes.', 403);
    }

    const passwordMatch = await passwordUtils.verify(password, user.password_hash);

    if (!passwordMatch) {
      await userRepository.update(user.id, {
        failed_login_attempts: user.failed_login_attempts + 1,
        last_login: new Date(),
      });
      logger.warn(`Login failed for ${email}: Incorrect password.`);
      throw new AppError('Invalid credentials', 401);
    }

    // Reset failed attempts on success
    await userRepository.update(user.id, {
      failed_login_attempts: 0,
      last_login: new Date(),
    });

    // Modernização de segurança: Re-hash se necessário (migração transparente para Argon2id)
    if (passwordUtils.needsRehash(user.password_hash)) {
      const newHash = await passwordUtils.hash(password);
      await userRepository.update(user.id, { password_hash: newHash });
      logger.info(`Password hash updated to Argon2id for user: ${email}`);
    }

    const permissions = await userRepository.getUserPermissions(user.id);
    const userRoleName = await userRepository.getUserRole(user.id);

    // Sugestão Sênior #9: Session Hijacking Protection (IP & UA Binding)
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: userRoleName,
      permissions,
      ip,
      ua: userAgent,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Log activity with fingerprint
    await logActivityService.logActivity({
      userId: user.id,
      action: 'User Logged In',
      resourceType: 'User',
      resourceId: user.id,
      details: { ip, device: userAgent },
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: userRoleName, permissions },
      accessToken,
      refreshToken,
    };
  },

  async refreshAccessToken(refreshToken: string) {
    const savedToken = await refreshTokenRepository.findByToken(refreshToken);

    if (!savedToken || new Date() > new Date(savedToken.expires_at)) {
      if (savedToken) await refreshTokenRepository.deleteByToken(refreshToken);
      throw new AppError('Refresh token expired or invalid', 401);
    }

    const user = await userRepository.findById(savedToken.user_id);
    if (!user) throw new AppError('User not found', 401);

    const permissions = await userRepository.getUserPermissions(user.id);
    const userRoleName = await userRepository.getUserRole(user.id);

    const payload: JwtPayload = { id: user.id, email: user.email, role: userRoleName, permissions };
    const accessToken = this.generateAccessToken(payload);

    return { accessToken };
  },

  async logout(refreshToken: string) {
    await refreshTokenRepository.deleteByToken(refreshToken);
  },

  async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await userRepository.update(user.id, {
      reset_password_token: hashedToken,
      reset_password_expires: passwordResetExpires,
    });

    // TODO: Use environment variable for frontend URL
    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await emailService.sendEmail(email, 'Your password reset token (valid for 10 min)', message);
    } catch (_err) {
      await userRepository.update(user.id, {
        reset_password_token: null, // any works here as null implies clear
        reset_password_expires: null as any,
      });
      throw new AppError('There was an error sending the email. Try again later!', 500);
    }
  },

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userRepository.findUserValidForReset(hashedToken);

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    const hashedPassword = await passwordUtils.hash(newPassword);

    await userRepository.update(user.id, {
      password_hash: hashedPassword,
      reset_password_token: null, // Limpa o token
      reset_password_expires: null as any, // Limpa a data
    });

    // Auto login
    const permissions = await userRepository.getUserPermissions(user.id);
    const userRoleName = await userRepository.getUserRole(user.id);

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: userRoleName,
      permissions,
    };
    const jwtToken = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', {
      expiresIn: '1h',
    });

    return { token: jwtToken };
  },

  async generateTokenFor2FA(userId: string) {
    // Find user details by userId
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const permissions = await userRepository.getUserPermissions(user.id);
    const userRoleName = await userRepository.getUserRole(user.id);

    const payload: JwtPayload = { id: user.id, email: user.email, role: userRoleName, permissions };
    const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });

    // Log activity
    await logActivityService.logActivity({
      userId: user.id,
      action: 'User Logged In (2FA Verified)',
      resourceType: 'User',
      resourceId: user.id,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: userRoleName, permissions },
      token,
    };
  },
};
