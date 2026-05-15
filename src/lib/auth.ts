import {
	SignJWT, jwtVerify,
} from 'jose';
import {
	cookies,
} from 'next/headers';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
	throw new Error('JWT_SECRET environment variable is not set');
}
const key = new TextEncoder().encode(secretKey);

const ALG = 'HS256';

export function signJWT(payload: any, expiresIn = '24h') {
	return new SignJWT(payload)
		.setProtectedHeader({
			alg: ALG,
		})
		.setIssuedAt()
		.setExpirationTime(expiresIn)
		.sign(key);
}

export async function verifyJWT(token: string) {
	try {
		const {
			payload,
		} = await jwtVerify(token, key, {
			algorithms: [
				ALG,
			],
		});
		return payload;
	}
	catch (error) {
		console.error(error);
		return null;
	}
}

export async function getSession() {
	const cookieStore = await cookies();
	const token = cookieStore.get('auth-token')?.value;
	if (!token) { return null; }
	return verifyJWT(token);
}

export async function login(userData: { id: string, email: string, role: string, isEditor: boolean, odRegionId?: string | null, locationId?: string | null, teamId?: string | null }) {
	const token = await signJWT({
		sub: userData.id,
		email: userData.email,
		role: userData.role,
		isEditor: userData.isEditor,
		odRegionId: userData.odRegionId,
		locationId: userData.locationId,
		teamId: userData.teamId,
	});
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

export async function logoutSalesSession() {
	const cookieStore = await cookies();
	cookieStore.delete('sales-session-id');
}

// Session signing for non-auth cookies (e.g. sales-session-id)
export function signSessionId(id: string) {
	return signJWT({
		id,
	}, '30d');
}

export async function verifySessionId(token: string) {
	const payload = await verifyJWT(token);
	return payload?.id as string | undefined;
}

export function signDeviceId(deviceId: string) {
	return signJWT({
		deviceId,
	}, '365d'); // Device ID lasts 1 year
}

export async function verifyDeviceId(token: string) {
	const payload = await verifyJWT(token);
	return payload?.deviceId as string | undefined;
}
