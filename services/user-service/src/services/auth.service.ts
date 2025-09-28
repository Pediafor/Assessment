import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/paseto";
import prisma from "../prismaClient"; 

export async function issueTokens(userId: string) {
  const accessToken = await generateAccessToken({ userId });
  const refreshToken = await generateRefreshToken({ userId });

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  const payload = await verifyToken(refreshToken);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  return await generateAccessToken({ userId: payload.userId });
}
