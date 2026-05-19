import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  isVerified: boolean;
  role?: string;
  iat?: number;
  exp?: number;
}

// ─── Password helpers ──────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── JWT helpers ───────────────────────────────────────────────────────────────

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// ─── Request auth helper ───────────────────────────────────────────────────────

export function getUserFromRequest(req: NextRequest): JwtPayload | null {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.cookies.get('vexta_token')?.value;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : cookieToken;

    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

// ─── Referral code generator ───────────────────────────────────────────────────

export function generateReferralCode(firstName: string, lastName: string): string {
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return `VXT_${initials}_${rand}`;
}
