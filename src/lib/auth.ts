import { type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET environment variable is not set. Please provide a strong secret.");
}

export interface UserPayload {
  id: string;
  email: string;
  role: 'client' | 'freelancer';
}


export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}


export async function comparePassword(password: string, hash: string): Promise<boolean> {
   return await bcrypt.compare(password, hash);
}


export async function generateToken(payload: UserPayload): Promise<string> {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' }); // Example: 1 day expiry
}


export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    // The decoded type will include standard JWT claims like iat, exp
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload & UserPayload;

    // Basic check for required fields after verification
    if (decoded && decoded.id && decoded.email && decoded.role) {
        return { id: decoded.id, email: decoded.email, role: decoded.role };
    }
    return null;
  } catch (error) {

    if (error instanceof jwt.TokenExpiredError) {
        console.log("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
        console.error("Invalid token:", error.message);
    } else {
        console.error("Token verification failed:", error);
    }
    return null;
  }
}


export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    const token = request.cookies.get('authToken')?.value;
    if (token) return token;

    return null;
}


export async function getCurrentUser(request: NextRequest): Promise<UserPayload | null> {
    const token = getTokenFromRequest(request);
    if (!token) {
        return null;
    }
    return await verifyToken(token);
}
