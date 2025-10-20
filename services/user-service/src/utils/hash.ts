import argon2 from "argon2";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

// Supports both argon2 and bcrypt password hashes for backward compatibility with seeded data
export async function verifyPassword(hash: string, password: string) {
  try {
    if (!hash || typeof hash !== 'string') return false;

    // Detect bcrypt hashes ($2a$, $2b$, $2y$)
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return await bcrypt.compare(password, hash);
    }

    // Detect argon2 hashes
    if (hash.startsWith('$argon2')) {
      return await argon2.verify(hash, password);
    }

    // Fallback: try argon2 first, then bcrypt
    try {
      return await argon2.verify(hash, password);
    } catch {
      return await bcrypt.compare(password, hash);
    }
  } catch {
    return false;
  }
}
