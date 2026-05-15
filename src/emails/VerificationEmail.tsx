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

interface VerificationEmailProps {
	firstName: string;
	verificationLink: string;
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

export const VerificationEmail = ({
	firstName,
	verificationLink,
	appUrl,
}: VerificationEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Bestätige deine E-Mail für die Sales Experience.</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoContainer}>
						<Img
							src={`${appUrl}/se-logo.svg`}
							alt="Sales Experience Logo"
							width="180"
						/>
					</Section>

					<Text style={h1}>E-Mail Bestätigung</Text>

					<Text style={text}>Hallo {firstName},</Text>
					<Text style={text}>
						bitte bestätige deine E-Mail-Adresse, um die Sales Experience nutzen
						zu können. Klicke dazu einfach auf den folgenden Button:
					</Text>

					<Section style={buttonContainer}>
						<Link href={verificationLink} style={button}>
							E-Mail bestätigen
						</Link>
					</Section>

					<Hr style={hr} />

					<Text style={footer}>
						Diese E-Mail wurde nach einer Anfrage im Setup gesendet. Falls du
						das nicht warst, kannst du diese E-Mail ignorieren.
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
						v2.3
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

export default VerificationEmail;
