import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export async function POST(req: NextRequest) {
	try {
		const { masterKey } = await req.json();
		const expectedKey = process.env.MASTER_KEY || 'TelekomMaster2026!';

		if (masterKey === expectedKey) {
			await login({
				id: 'master-owner',
				email: 'owner@sxp.internal',
				role: 'ADMIN',
				isEditor: true,
			});
			return NextResponse.json({ success: true });
		}

		return NextResponse.json({ error: 'Ungültiger Master-Key' }, { status: 401 });
	} catch (error) {
		return NextResponse.json({ error: 'Fehler bei der Anmeldung' }, { status: 500 });
	}
}
