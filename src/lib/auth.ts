import { SignJWT, jwtVerify, errors as JoseErrors } from 'jose';
import { cookies } from 'next/headers';
import { logger } from './logger';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error('JWT_SECRET environment variable is not set');
const key = new TextEncoder().encode(secretKey);

const ALG = 'HS256';

// typ claim prevents a token issued for one purpose from being accepted in another context.
// Without it, a leaked sales-session token could theoretically be replayed as an auth-token.
export type JwtTyp = 'auth' | 'sales-session' | 'device' | 'session-binding';

export function signJWT(payload: object, expiresIn = '4h', typ: JwtTyp = 'auth') {
  return new SignJWT({ ...payload, typ })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

// expectedTyp: if provided, the token is rejected when the typ claim doesn't match.
export async function verifyJWT(token: string, expectedTyp?: JwtTyp) {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: [ALG] });
    if (expectedTyp && payload.typ !== expectedTyp) return null;
    return payload;
  } catch (error) {
    // JWTExpired is normal on any unauthenticated request or after 4h idle.
    // Logging it as console.error floods Sentry/Datadog with false alarms.
    if (!(error instanceof JoseErrors.JWTExpired)) {
      logger.warn(`JWT verification failed: ${(error as Error).message}`);
    }
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;
  return verifyJWT(token, 'auth');
}

export async function login(userData: {
  id: string;
  email: string;
  role: string;
  isEditor: boolean;
  odRegionId?: string | null;
  locationId?: string | null;
  teamId?: string | null;
}) {
  const token = await signJWT(
    {
      sub: userData.id,
      email: userData.email,
      role: userData.role,
      isEditor: userData.isEditor,
      odRegionId: userData.odRegionId,
      locationId: userData.locationId,
      teamId: userData.teamId,
    },
    '4h',
    'auth',
  );
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 4, // 4h — matches JWT expiry
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function logoutSalesSession() {
  const cookieStore = await cookies();
  cookieStore.delete('sales-session-id');
}

export function signSessionId(id: string) {
  return signJWT({ id }, '30d', 'sales-session');
}

export async function verifySessionId(token: string) {
  const payload = await verifyJWT(token, 'sales-session');
  return payload?.id as string | undefined;
}

export function signDeviceId(deviceId: string) {
  return signJWT({ deviceId }, '365d', 'device');
}

export async function verifyDeviceId(token: string) {
  const payload = await verifyJWT(token, 'device');
  return payload?.deviceId as string | undefined;
}

// Short-lived token that binds a pending SalesSession to the browser that created it.
// Prevents finalizeLogin from being called by anyone who guesses/intercepts the session CUID.
export function signSessionBinding(sessionId: string) {
  return signJWT({ sid: sessionId }, '10m', 'session-binding');
}

export async function verifySessionBinding(token: string) {
  const payload = await verifyJWT(token, 'session-binding');
  return payload?.sid as string | undefined;
}
