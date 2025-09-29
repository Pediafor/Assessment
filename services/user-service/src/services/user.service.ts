import prisma from "../prismaClient";
import { UserRole } from "@prisma/client";

interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  metadata?: any;
}

interface GetUsersOptions {
  page: number;
  limit: number;
  role?: string;
}

// Register new user
export async function registerUser(userData: CreateUserData) {
  return await prisma.user.create({
    data: {
      email: userData.email,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'STUDENT',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
}

// Get user by ID
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: {
      id: id,
      isActive: true // Only return active users
    }
  });
}

// Get user by email (for login)
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
      isActive: true
    }
  });
}

// Update user
export async function updateUser(id: string, userData: UpdateUserData) {
  try {
    return await prisma.user.update({
      where: {
        id: id,
        isActive: true
      },
      data: {
        ...userData,
        updatedAt: new Date()
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Record not found
      return null;
    }
    throw error;
  }
}

// Soft delete user
export async function deleteUser(id: string) {
  try {
    return await prisma.user.update({
      where: {
        id: id,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

// Get all users with pagination
export async function getAllUsers(options: GetUsersOptions) {
  const { page, limit, role } = options;
  
  const where: any = {
    isActive: true
  };

  if (role) {
    where.role = role.toUpperCase();
  }

  return await prisma.user.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// Update last login
export async function updateLastLogin(id: string) {
  return await prisma.user.update({
    where: { id },
    data: {
      lastLogin: new Date(),
      updatedAt: new Date()
    }
  });
}

// Store refresh token
export async function storeRefreshToken(userId: string, refreshToken: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken,
      updatedAt: new Date()
    }
  });
}

// Remove refresh token (logout)
export async function removeRefreshToken(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      refreshToken: null,
      updatedAt: new Date()
    }
  });
}