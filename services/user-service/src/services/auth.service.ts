import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/paseto";
import prisma from "../prismaClient"; 

export async function issueTokens(userId: string) {
  const accessToken = await generateAccessToken({ userId });
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

  // Generate new access token
  const accessToken = await generateAccessToken({ userId });
  
  // Optionally rotate refresh token for better security
  const newRefreshToken = await generateRefreshToken({ userId });
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: newRefreshToken },
  });

  return { accessToken };
}
