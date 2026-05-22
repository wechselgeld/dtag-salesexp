import {
  SignJWT, jwtVerify, errors as JoseErrors,
} from 'jose';
import {
  cookies,
} from 'next/headers';
import {
  logger,
} from './logger';
import bcrypt from 'bcryptjs';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error('JWT_SECRET environment variable is not set');
const key = new TextEncoder().encode(secretKey);

const ALG = 'HS256';

export type JwtTyp = 'auth' | 'sales-session' | 'device' | 'session-binding';

export interface SessionUser {
  sub: string;
  email: string;
  role: string;
  isEditor: boolean;
  firstName?: string | null;
  lastName?: string | null;
  odRegionId?: string | null;
  locationId?: string | null;
  teamId?: string | null;
  effectiveOdRegionId?: string | null;
  effectiveLocationId?: string | null;
  sessionVersion?: number;
}

export function signJWT(payload: object, expiresIn = '4h', typ: JwtTyp = 'auth') {
  return new SignJWT({
    ...payload,
    typ,
  })
    .setProtectedHeader({
      alg: ALG,
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyJWT(token: string, expectedTyp?: JwtTyp) {
  try {
    const {
      payload,
    } = await jwtVerify(token, key, {
      algorithms: [
        ALG,
      ],
    });
    if (expectedTyp && payload.typ !== expectedTyp) return null;
    return payload;
  }
  catch (error) {
    if (!(error instanceof JoseErrors.JWTExpired)) {
      logger.warn(`JWT verification failed: ${(error as Error).message}`);
    }
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyJWT(token, 'auth') as any;
}

export async function login(userData: {
  id: string;
  email: string;
  role: string;
  isEditor: boolean;
  odRegionId?: string | null;
  locationId?: string | null;
  teamId?: string | null;
  sessionVersion?: number;
}) {
  const isSalesUser = userData.role === 'USER';
  const expiresIn = isSalesUser ? '30d' : '4h';
  const maxAge = isSalesUser ? 60 * 60 * 24 * 30 : 60 * 60 * 4;

  const token = await signJWT(
    {
      sub: userData.id,
      email: userData.email,
      role: userData.role,
      isEditor: userData.isEditor,
      odRegionId: userData.odRegionId,
      locationId: userData.locationId,
      teamId: userData.teamId,
      sessionVersion: userData.sessionVersion || 1,
    },
    expiresIn,
    'auth',
  );
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('sales-session-id');
}

export async function logoutSalesSession() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('sales-session-id');
}

export function signSessionId(id: string) {
  return signJWT({
    id,
  }, '30d', 'sales-session');
}

export async function verifySessionId(token: string) {
  const payload = await verifyJWT(token, 'sales-session');
  return payload?.id as string | undefined;
}

export function signDeviceId(deviceId: string) {
  return signJWT({
    deviceId,
  }, '365d', 'device');
}

export async function verifyDeviceId(token: string) {
  const payload = await verifyJWT(token, 'device');
  return payload?.deviceId as string | undefined;
}

export function signSessionBinding(sessionId: string) {
  return signJWT({
    sid: sessionId,
  }, '10m', 'session-binding');
}

export async function verifySessionBinding(token: string) {
  const payload = await verifyJWT(token, 'session-binding');
  return payload?.sid as string | undefined;
}

export function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  return bcrypt.compare(pin, hashedPin);
}
