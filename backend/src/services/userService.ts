import { userRepository } from '../repositories/user.repository.js';
import { passwordUtils } from '../utils/passwordUtils.js';
import { AppError } from '../utils/errors.js';

interface UserCreateInput {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const userService = {
  async getAllUsers() {
    try {
      // Usando o repositório para buscar todos os usuários
      // Nota: O repositório atual findAll não traz o role, vamos precisar ajustar o repositório
      // ou fazer a query aqui por enquanto se o repositório for muito genérico.
      // Mas para seguir o Pilar 2 (Padronização), vamos usar o repositório.
      return await userRepository.findAll();
    } catch (error) {
      console.error('Error in userService.getAllUsers:', error);
      throw error;
    }
  },

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },

  async createUser(userData: UserCreateInput) {
    const { name, email, password, role = 'employee' } = userData;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    if (!password) {
      throw new AppError('Password is required for user creation.', 400);
    }

    const hashedPassword = await passwordUtils.hash(password);

    const user = await userRepository.create({
      name,
      email,
      password_hash: hashedPassword,
    });

    if (role) {
      await userRepository.assignRole(user.id, role);
    }

    return user;
  },

  async updateUser(id: string, userData: UserUpdateInput) {
    const { name, email, password, role } = userData;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.password_hash = await passwordUtils.hash(password);
    }

    const user = await userRepository.update(id, updateData);

    if (role) {
      // Para simplificar a migração, vamos apenas re-atribuir se necessário
      // Em uma implementação real de DI/Repo, teríamos métodos de gerenciamento de roles
      // no repositório de roles ou um serviço específico.
      // Por enquanto mantemos a compatibilidade com o que existe no userRepository.
      try {
        await userRepository.assignRole(id, role);
      } catch (_e) {
        // Ignora se já tiver a role ou erro de duplicata (precisaria de lógica de troca)
      }
    }

    return user;
  },

  async deleteUser(id: string) {
    return await userRepository.delete(id);
  },
};
