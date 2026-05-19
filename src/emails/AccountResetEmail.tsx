import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Text,
	Link,
	Hr,
	Img,
} from '@react-email/components';
import React from 'react';

interface AccountResetEmailProps {
	email: string;
	firstName?: string | null;
	appUrl: string;
}

const main = {
	backgroundColor: '#f6f9fc',
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: '#ffffff',
	margin: '0 auto',
	padding: '40px 20px',
	marginBottom: '64px',
	borderRadius: '12px',
	boxShadow: '0 4px 14px rgba(0, 0, 0, 0.05)',
	maxWidth: '580px',
};

const logoContainer = {
	textAlign: 'left' as const,
	marginBottom: '32px',
};

const h1 = {
	color: '#e20074',
	fontSize: '24px',
	fontWeight: '700',
	lineHeight: '1.2',
	margin: '0 0 24px',
	textAlign: 'left' as const,
};

const text = {
	color: '#333',
	fontSize: '16px',
	lineHeight: '26px',
	margin: '0 0 20px',
};

const hr = {
	borderColor: '#eaedf0',
	margin: '32px 0 24px',
};

const footer = {
	color: '#8898aa',
	fontSize: '13px',
	lineHeight: '20px',
	margin: '0',
	textAlign: 'center' as const,
};

const buttonContainer = {
	textAlign: 'center' as const,
	margin: '32px 0',
};

const buttonStyle = {
	backgroundColor: '#e20074',
	borderRadius: '8px',
	color: '#fff',
	fontSize: '16px',
	fontWeight: '600',
	textDecoration: 'none',
	textAlign: 'center' as const,
	display: 'inline-block',
	padding: '14px 28px',
	boxShadow: '0 4px 14px rgba(226, 0, 116, 0.25)',
};

const noticeBox = {
	backgroundColor: '#fff0f6',
	borderLeft: '4px solid #e20074',
	borderRadius: '8px',
	padding: '24px',
	margin: '32px 0',
};

const noticeTitle = {
	color: '#e20074',
	fontSize: '16px',
	fontWeight: '700',
	margin: '0 0 12px',
};

const adminButtonContainer = {
	marginTop: '16px',
	display: 'inline-block',
};

const adminButton = {
	backgroundColor: '#e20074',
	borderRadius: '6px',
	color: '#fff',
	fontSize: '14px',
	fontWeight: '600',
	textDecoration: 'none',
	display: 'inline-block',
	padding: '10px 18px',
	marginRight: '12px',
	marginBottom: '10px',
};

const adminButtonSecondary = {
	backgroundColor: '#ffffff',
	border: '1px solid #e20074',
	borderRadius: '6px',
	color: '#e20074',
	fontSize: '14px',
	fontWeight: '600',
	textDecoration: 'none',
	display: 'inline-block',
	padding: '10px 18px',
	marginBottom: '10px',
};

export const AccountResetEmail = ({
	email, firstName, appUrl,
}: AccountResetEmailProps) => {
	const greeting = firstName ? `Hallo ${firstName},` : 'Guten Tag,';

	const encodedTeamsMessage = encodeURIComponent(
		`Hallo Felix,\n\nich habe mich auf der neuen Sales Experience Plattform registriert und benötige Admin-Rechte für meinen Account: ${email}.\n\nViele Grüße`,
	);
	const teamsUrl = `msteams:/l/chat/0/0?users=felix.kinze@telekom.de&message=${encodedTeamsMessage}`;

	const mailtoSubject = encodeURIComponent('Freischaltung Admin-Rechte Sales Experience');
	const mailtoBody = encodeURIComponent(
		`Hallo Felix,\n\nich habe mich auf der neuen Sales Experience Plattform registriert und benötige Admin-Rechte für meinen Account: ${email}.\n\nViele Grüße`,
	);
	const mailtoUrl = `mailto:felix.kinze@telekom.de?subject=${mailtoSubject}&body=${mailtoBody}`;

	return (
		<Html>
			<Head />
			<Preview>Wichtige Information zu deinem Sales Experience Konto</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoContainer}>
						<Img
							src={`${appUrl}/se-logo.svg`}
							alt="Sales Experience Logo"
							width="180"
						/>
					</Section>

					<Text style={h1}>Wichtige Systemaktualisierung</Text>

					<Text style={text}>{greeting}</Text>
					<Text style={text}>
						Buff Interactive hat wichtige Sicherheits- und Struktur-Aktualisierungen an der Authentifizierung und der Kontoverwaltung der Sales Experience Plattform vorgenommen.
					</Text>

					<Text style={text}>
						Im Zuge dieser Umstellung müssen alle bestehenden Konten zurückgesetzt werden - dazu zählt auch Deines. Dein bisheriges Passwort und Einstellungen können aus Sicherheitsgründen leider nicht automatisch in das neue System übertragen werden.
					</Text>

					<Text style={{
						...text,
						fontWeight: 'bold',
						marginBottom: '8px',
					}}>
						Was bedeutet das für Dich?
					</Text>
					<Text style={text}>
						Du musst Dich einmalig neu auf der Plattform registrieren, um Deinen Zugang zu reaktivieren. Verwende dazu bitte Deine bekannte E-Mail-Adresse:{' '}
						<span style={{
							fontWeight: '600',
							color: '#e20074',
						}}>{email}</span>.
					</Text>

					<Section style={buttonContainer}>
						<Link href="https://sales.buffinteractive.net/setup" style={buttonStyle}>
							Jetzt neu registrieren
						</Link>
					</Section>

					<Text style={text}>
						Die Registrierung dauert nur wenige Augenblicke.
					</Text>

					<Section style={noticeBox}>
						<Text style={noticeTitle}>Wichtiger Hinweis für Administratoren</Text>
						<Text style={{
 ...text,
fontSize: '15px',
lineHeight: '24px',
margin: '0 0 16px',
}}>
							Falls Du Administrator-Rechte besessen hast, registriere Dich bitte zuerst selbst regulär über den obigen Link. Sende anschließend eine kurze Benachrichtigung per MS Teams oder E-Mail an <span style={{
 fontWeight: '600',
}}>felix.kinze@telekom.de</span>, damit Deine Administrator-Rechte wieder freigeschaltet werden können. Das kannst Du auch direkt über die beiden Buttons hier machen:
						</Text>
						<Section style={adminButtonContainer}>
							<Link href={teamsUrl} style={adminButton}>
								Per MS Teams freischalten
							</Link>
							<Link href={mailtoUrl} style={adminButtonSecondary}>
								Per E-Mail freischalten
							</Link>
						</Section>
					</Section>

					<Text style={text}>
						Wir bitten die Umstände zu entschuldigen und danken dir herzlich für deine Unterstützung und dein Verständnis!
					</Text>

					<Hr style={hr} />

					<Text style={footer}>
						Diese E-Mail wurde automatisch generiert. Bitte antworte nicht darauf.
					</Text>
					<Text style={{
						...footer,
						marginTop: '8px',
					}}>
						&copy; {new Date().getFullYear()} buffinteractive.net für Deutsche Telekom
						Service GmbH |{' '}
						<span style={{
							color: '#e20074',
							fontWeight: '600',
						}}>
							Sales Experience
						</span>{' '}
						v3.0
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

export default AccountResetEmail;
