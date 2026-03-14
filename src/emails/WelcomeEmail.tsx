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

interface WelcomeEmailProps {
	email: string;
	role: string;
	tempPassword?: string;
	loginUrl: string;
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

const accentText = {
	...text,
	fontWeight: '600',
};

const credentialsBox = {
	backgroundColor: '#f7f8fa',
	border: '1px solid #eaedf0',
	borderRadius: '8px',
	padding: '24px',
	margin: '24px 0',
};

const credentialRow = {
	margin: '0 0 12px',
	fontSize: '16px',
	color: '#333',
};

const credentialLabel = {
	fontWeight: '600',
	color: '#666',
	display: 'inline-block',
	width: '100px',
};

const credentialValue = {
	fontWeight: '700',
	fontFamily: 'monospace',
	fontSize: '18px',
	color: '#1a1a2e',
};

const buttonContainer = {
	textAlign: 'center' as const,
	margin: '32px 0',
};

const button = {
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

export const WelcomeEmail = ({
	email,
	role,
	tempPassword,
	loginUrl,
	appUrl,
}: WelcomeEmailProps) => {
	const roleName = role === 'ADMIN' ? 'Administrator' : 'Team Leader';

	return (
		<Html>
			<Head />
			<Preview>Dein Konto für die Sales Experience wurde erstellt.</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoContainer}>
						<Img
							src={`${appUrl}/se-logo.svg`}
							alt="Sales Experience Logo"
							width="180"
						/>
					</Section>

					<Text style={h1}>Willkommen bei der Sales Experience</Text>

					<Text style={text}>Guten Tag,</Text>
					<Text style={text}>
						Dir wurde ein Zugang zur Verwaltung der{' '}
						<span style={accentText}>Sales Experience</span> als{' '}
						<span style={accentText}>{roleName}</span> eingerichtet.
					</Text>

					<Section style={credentialsBox}>
						<Text
							style={{
								...text,
								fontWeight: '700',
								marginBottom: '16px',
								color: '#1a1a2e',
							}}
						>
							Deine Zugangsdaten
						</Text>
						<Text style={credentialRow}>
							<span style={credentialLabel}>E-Mail:</span>
							<span style={credentialValue}>{email}</span>
						</Text>
						{tempPassword && (
							<Text style={{
								...credentialRow,
								marginBottom: 0,
							}}>
								<span style={credentialLabel}>Passwort:</span>
								<span style={credentialValue}>{tempPassword}</span>
							</Text>
						)}
						{!tempPassword && (
							<Text
								style={{
									...credentialRow,
									marginBottom: 0,
									fontSize: '14px',
									color: '#888',
								}}
							>
								(Passwort wurde bereits anderweitig kommuniziert)
							</Text>
						)}
					</Section>

					{tempPassword && (
						<Text
							style={{
								...text,
								fontSize: '14px',
								color: '#e20074',
								textAlign: 'center' as const,
							}}
						>
							Bitte ändere dein Passwort nach dem ersten Login!
						</Text>
					)}

					<Section style={buttonContainer}>
						<Link href={loginUrl} style={button}>
							Zum Dashboard Login
						</Link>
					</Section>

					<Hr style={hr} />

					<Text style={{
						...footer,
						marginBottom: '12px',
						fontSize: '12px',
					}}>
						<Link
							href={`${appUrl}/impressum`}
							style={{
								color: '#8898aa',
								textDecoration: 'none',
								margin: '0 8px',
							}}
						>
							Impressum
						</Link>
						&middot;
						<Link
							href={`${appUrl}/privacy`}
							style={{
								color: '#8898aa',
								textDecoration: 'none',
								margin: '0 8px',
							}}
						>
							Datenschutz
						</Link>
						&middot;
						<Link
							href={`${appUrl}/faq`}
							style={{
								color: '#8898aa',
								textDecoration: 'none',
								margin: '0 8px',
							}}
						>
							FAQ
						</Link>
					</Text>
					<Text style={footer}>
						Diese E-Mail wurde automatisch generiert. Bitte antworte nicht
						darauf.
					</Text>
					<Text style={{
						...footer,
						marginTop: '8px',
					}}>
						&copy; {new Date().getFullYear()} Felix Kinze für Deutsche Telekom
						Service GmbH |{' '}
						<span style={{
							color: '#e20074',
							fontWeight: '600',
						}}>
							Sales Experience
						</span>{' '}
						v2.3
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

export default WelcomeEmail;
