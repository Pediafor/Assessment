import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/paseto";
import prisma from "../prismaClient"; 
import { getUserByEmail, storePasswordResetToken, getUserByEmailVerificationToken } from "./user.service";
import { sendEmail } from "../utils/email";
import crypto from "crypto";

export async function issueTokens(userId: string, extras?: { email?: string; role?: string; firstName?: string; lastName?: string; }) {
  const accessToken = await generateAccessToken({ 
    userId,
    email: extras?.email,
    role: extras?.role,
    firstName: extras?.firstName,
    lastName: extras?.lastName,
  });
  const refreshToken = await generateRefreshToken({ userId });

  // Store refresh token in database only
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });

  // Only return access token to client
  return { accessToken };
}

export async function refreshAccessToken(userId: string) {
  // Get user and their stored refresh token
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.refreshToken) {
    throw new Error("Invalid refresh token");
  }

  // Verify the refresh token stored in DB
  try {
    const payload = await verifyToken(user.refreshToken);
    if (payload.userId !== userId) {
      throw new Error("Invalid refresh token");
    }
  } catch (error) {
    // Token expired or invalid, remove it
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    throw new Error("Invalid refresh token");
  }

  // Generate new access token (include latest role/email)
  const accessToken = await generateAccessToken({ 
    userId,
    email: user.email,
    role: user.role,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
  });
  
  // Optionally rotate refresh token for better security
  const newRefreshToken = await generateRefreshToken({ userId });
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: newRefreshToken },
  });

  return { accessToken };
}

export async function initiatePasswordReset(email: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    // Don't reveal that the user doesn't exist
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  await storePasswordResetToken(user.id, resetToken, resetTokenExpiry);

  // Send password reset email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `Please click this link to reset your password: ${resetLink}`,
    html: `<p>Please click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  });
}

export async function verifyEmail(token: string) {
  const user = await getUserByEmailVerificationToken(token);
  if (!user) {
    return null;
  }

  return await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      updatedAt: new Date()
    }
  });
}
