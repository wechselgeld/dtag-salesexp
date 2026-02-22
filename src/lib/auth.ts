import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET || 'dev-secret-key-change-me';
const key = new TextEncoder().encode(secretKey);

const ALG = 'HS256';

export async function signJWT(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime('24h')
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
