import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'rawaei_super_secret_jwt_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(request?: Request): Promise<TokenPayload | null> {
  try {
    let token: string | undefined;

    // 1. Check Authorization or x-admin-token header
    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
      if (!token) {
        token = request.headers.get('x-admin-token') || undefined;
      }
    }

    // 2. Check cookies
    if (!token) {
      const cookieStore = cookies();
      token =
        cookieStore.get('rawaei_auth_token')?.value ||
        cookieStore.get('rawaei_admin_token')?.value;
    }

    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<TokenPayload> {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}
