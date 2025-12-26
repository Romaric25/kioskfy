import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "crypto";

/**
 * Secret key for JWT signing and verification
 * In production, this should be loaded from environment variables
 */
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Convert string secret to Uint8Array for jose
 */
const getSecretKey = (): Uint8Array => {
  return new TextEncoder().encode(JWT_SECRET);
};

/**
 * Token expiration times
 */
export const TOKEN_EXPIRATION = {
  EMAIL_VERIFICATION: "24h",
  PASSWORD_RESET: "1h",
  ACCESS_TOKEN: "15m",
  REFRESH_TOKEN: "7d",
  PDF: "2h",
} as const;

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId?: string;
  email?: string;
  newspaperId?: string;
  type: "email_verification" | "password_reset" | "access" | "refresh" | "pdf";
  [key: string]: any;
}

/**
 * Generate a JWT token
 * @param payload - The data to include in the token
 * @param expiresIn - Token expiration time (default: 24h for email verification)
 * @returns The signed JWT token
 */
export async function generateToken(
  payload: JWTPayload,
  expiresIn: string = TOKEN_EXPIRATION.EMAIL_VERIFICATION
): Promise<string> {
  try {
    const secretKey = getSecretKey();

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .setIssuer("epress-afrique")
      .setAudience("epress-afrique-users")
      .sign(secretKey);

    return token;
  } catch (error) {
    throw new Error("TOKEN_GENERATION_FAILED", { cause: error });
  }
}

/**
 * Verify and decode a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const secretKey = getSecretKey();

    const { payload } = await jwtVerify(token, secretKey, {
      issuer: "epress-afrique",
      audience: "epress-afrique-users",
    });

    return payload as JWTPayload;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "ERR_JWT_EXPIRED") {
        throw new Error("Token has expired");
      } else if (error.code === "ERR_JWT_INVALID") {
        throw new Error("Invalid token");
      }
    }
    throw new Error("TOKEN_VERIFICATION_FAILED", { cause: error });
  }
}

/**
 * Check if a token is expired without throwing an error
 * @param token - The JWT token to check
 * @returns true if expired, false if valid
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    await verifyToken(token);
    return false; // Token is valid
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Token has expired") {
      return true;
    }
    // For other errors (invalid token, etc.), consider it as expired/invalid
    return true;
  }
}

/**
 * Generate an email verification token
 * @param userId - The user ID
 * @param email - The user email
 * @returns The email verification token
 */
export async function generateEmailVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  const payload: JWTPayload = {
    userId,
    email,
    type: "email_verification",
  };

  return generateToken(payload, TOKEN_EXPIRATION.EMAIL_VERIFICATION);
}

/**
 * Generate a password reset token
 * @param userId - The user ID
 * @param email - The user email
 * @returns The password reset token
 */
export async function generatePasswordResetToken(
  userId: string,
  email: string
): Promise<string> {
  const payload: JWTPayload = {
    userId,
    email,
    type: "password_reset",
  };

  return generateToken(payload, TOKEN_EXPIRATION.PASSWORD_RESET);
}

/**
 * Verify an email verification token
 * @param token - The token to verify
 * @returns The decoded payload with userId and email
 * @throws Error if token is invalid, expired, or wrong type
 */
export async function verifyEmailVerificationToken(
  token: string
): Promise<{ userId: string; email: string }> {
  const payload = await verifyToken(token);

  if (payload.type !== "email_verification") {
    throw new Error("Invalid token type");
  }

  return {
    userId: payload.userId as string,
    email: payload.email as string,
  };
}

/**
 * Verify a password reset token
 * @param token - The token to verify
 * @returns The decoded payload with userId and email
 * @throws Error if token is invalid, expired, or wrong type
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<{ userId: string; email: string }> {
  const payload = await verifyToken(token);

  if (payload.type !== "password_reset") {
    throw new Error("Invalid token type");
  }

  return {
    userId: payload.userId as string,
    email: payload.email as string,
  };
}

/**
 * Generate a PDF token
 * @param userId - The user ID
 * @param newspaperId - The newspaper ID
 * @returns The PDF token
 */


export async function generatePdfToken(
  userId: string,
  newspaperId: string
): Promise<string> {
  const payload: JWTPayload = {
    userId,
    newspaperId,
    type: "pdf",
  };

  return generateToken(payload, TOKEN_EXPIRATION.PDF);
}


export async function verifyPdfToken(token: string): Promise<{ userId: string; newspaperId: string }> {
  const payload = await verifyToken(token);

  if (payload.type !== "pdf") {
    throw new Error("Invalid token type");
  }

  return {
    userId: payload.userId as string,
    newspaperId: payload.newspaperId as string,
  };
}

/**
 * Generate a random token and expiration date for manual database verification
 */
export function generateRandomVerificationToken() {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24h validity
  return { token, expiresAt };
}