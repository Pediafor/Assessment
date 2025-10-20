import prisma from "../prismaClient";
import { UserRole } from "@prisma/client";
import { UserEventPublisher } from "../events/publisher";
import { sendEmail } from "../utils/email";
import crypto from "crypto";
import { hashPassword } from "../utils/hash";

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
  q?: string; // optional search across email, firstName, lastName
}

// Register new user
export async function registerUser(userData: CreateUserData) {
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'STUDENT',
      isActive: true,
      emailVerificationToken,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Send verification email
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    text: `Please click this link to verify your email address: ${verificationLink}`,
    html: `<p>Please click this link to verify your email address: <a href="${verificationLink}">${verificationLink}</a></p>`,
  });

  // Publish user registration event
  await UserEventPublisher.publishUserRegistered({
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined
  });

  return user;
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

// Find user by email verification token
export async function getUserByEmailVerificationToken(token: string) {
  return await prisma.user.findFirst({
    where: {
      emailVerificationToken: token
    }
  });
}

// Find user by reset token
export async function getUserByResetToken(token: string) {
  return await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  });
}

// Reset password
export async function resetPassword(token: string, newPassword: string) {
  const user = await getUserByResetToken(token);
  if (!user) {
    return null;
  }

  const passwordHash = await hashPassword(newPassword);

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date()
    }
  });
}

// Update user
export async function updateUser(id: string, userData: UpdateUserData) {
  try {
    // Get current user data for comparison
    const currentUser = await getUserById(id);
    if (!currentUser) {
      return null;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
        isActive: true
      },
      data: {
        ...userData,
        updatedAt: new Date()
      }
    });

    // Publish profile update event
    await UserEventPublisher.publishUserProfileUpdated({
      userId: updatedUser.id,
      email: updatedUser.email,
      changes: userData
    });

    return updatedUser;
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
    // Get user data before deactivation
    const user = await getUserById(id);
    if (!user) {
      return null;
    }

    const deactivatedUser = await prisma.user.update({
      where: {
        id: id,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Publish user deactivation event
    await UserEventPublisher.publishUserDeactivated({
      userId: deactivatedUser.id,
      email: deactivatedUser.email
    });

    return deactivatedUser;
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

// Get users with pagination and optional search and total count
export async function getUsersPage(options: GetUsersOptions) {
  const { page, limit, role, q } = options;

  const where: any = {
    isActive: true,
  };

  if (role) {
    where.role = role.toUpperCase();
  }

  if (q && q.trim().length > 0) {
    const term = q.trim();
    where.OR = [
      { email: { contains: term, mode: 'insensitive' } },
      { firstName: { contains: term, mode: 'insensitive' } },
      { lastName: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { users, total, page, limit };
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

// Store password reset token
export async function storePasswordResetToken(userId: string, token: string, expiry: Date) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      resetPasswordToken: token,
      resetTokenExpiry: expiry,
      updatedAt: new Date()
    }
  });
}

// Reactivate user
export async function reactivateUser(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id, isActive: false }
    });

    if (!user) {
      return null;
    }

    const reactivatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date()
      }
    });

    // Publish user reactivation event
    await UserEventPublisher.publishUserReactivated({
      userId: reactivatedUser.id,
      email: reactivatedUser.email
    });

    return reactivatedUser;
  } catch (error: any) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}

// Change user role
export async function changeUserRole(id: string, newRole: UserRole) {
  try {
    const currentUser = await getUserById(id);
    if (!currentUser) {
      return null;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
        isActive: true
      },
      data: {
        role: newRole,
        updatedAt: new Date()
      }
    });

    // Publish role change event
    await UserEventPublisher.publishUserRoleChanged({
      userId: updatedUser.id,
      email: updatedUser.email,
      oldRole: currentUser.role,
      newRole: newRole
    });

    return updatedUser;
  } catch (error: any) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
}