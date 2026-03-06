import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not set');
}
const key = new TextEncoder().encode(secretKey);

const ALG = 'HS256';

export async function signJWT(payload: any, expiresIn: string = "24h") {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(key);
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: [ALG],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    return await verifyJWT(token);
}

export async function login(userId: string, role: string) {
    const token = await signJWT({ sub: userId, role });
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
    });
}


export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
}

// Session signing for non-auth cookies (e.g. sales-session-id)
export async function signSessionId(id: string) {
    return await signJWT({ id }, '30d');
}

export async function verifySessionId(token: string) {
    const payload = await verifyJWT(token);
    return payload?.id as string | undefined;
}
