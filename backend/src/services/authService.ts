import { AppError } from '../utils/errors.js';
import bcrypt from 'bcrypt';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { emailService } from './emailService.js';
import { logActivityService } from './logActivityService.js';
import crypto from 'crypto';
import { userRepository, Permission } from '../repositories/user.repository.js';
import { logger } from '../utils/logger.js';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  permissions: Permission[];
}

export const authService = {
  async register(name: string, email: string, password: string, roleName: string = 'user') {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // 1. Create User
      const user = await userRepository.create({
        name,
        email,
        password_hash: hashedPassword,
      });

      // 2. Assign Role
      try {
        await userRepository.assignRole(user.id, roleName);
      } catch (roleError) {
        throw new AppError(`Role '${roleName}' not found`, 400);
      }

      // 3. Get Permissions & Role Name (Confirmação)
      const permissions = await userRepository.getUserPermissions(user.id);
      
      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        role: roleName,
        permissions,
      };
      
      const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', {
        expiresIn: '1h',
      });

      // Log activity
      await logActivityService.logActivity({
        userId: user.id,
        action: 'User Registered',
        resourceType: 'User',
        resourceId: user.id,
        newValue: { name: user.name, email: user.email, role: roleName },
      });

      return {
        user: { id: user.id, name: user.name, email: user.email, role: roleName, permissions },
        token,
      };
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      throw error;
    }
  },

  async login(email: string, password: string) {
    logger.info(`Login attempt for: ${email}`);
    
    const user = await userRepository.findByEmail(email);

    if (!user || !user.password_hash) {
      logger.info('User not found or has no password set');
      throw new AppError('Invalid credentials', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      logger.info('Password does not match');
      throw new AppError('Invalid credentials', 401);
    }

    const permissions = await userRepository.getUserPermissions(user.id);
    const userRoleName = await userRepository.getUserRole(user.id);

    const payload: JwtPayload = { id: user.id, email: user.email, role: userRoleName, permissions };
    const token = sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1h' });

    // Log activity
    await logActivityService.logActivity({
      userId: user.id,
      action: 'User Logged In',
      resourceType: 'User',
      resourceId: user.id,
    });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: userRoleName, permissions },
      token,
    };
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
      reset_password_expires: passwordResetExpires
    });

    // TODO: Use environment variable for frontend URL
    const resetURL = `http://localhost:3000/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await emailService.sendEmail(email, 'Your password reset token (valid for 10 min)', message);
    } catch (err) {
      await userRepository.update(user.id, {
        reset_password_token: null, // any works here as null implies clear
        reset_password_expires: null as any 
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.update(user.id, {
      password_hash: hashedPassword,
      reset_password_token: null, // Limpa o token
      reset_password_expires: null as any // Limpa a data
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
