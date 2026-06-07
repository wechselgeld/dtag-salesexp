import {
	Html,
	Head,
	Preview,
	Body,
	Container,
	Section,
	Text,
	Hr,
	Img,
} from '@react-email/components';
import React from 'react';

interface PinResetEmailProps {
	firstName: string;
	code: string;
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

const codeContainer = {
	textAlign: 'center' as const,
	margin: '32px 0',
	backgroundColor: '#f7f8fa',
	borderRadius: '8px',
	padding: '16px',
	border: '1px solid #eaedf0',
};

const codeText = {
	color: '#e20074',
	fontSize: '32px',
	fontWeight: '700',
	letterSpacing: '6px',
	margin: '0',
	textAlign: 'center' as const,
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

const PinResetEmail = ({
	firstName,
	code,
	appUrl,
}: PinResetEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Dein PIN-Rücksetzcode für die Sales Experience.</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoContainer}>
						<Img
							src={`${appUrl}/se-logo.svg`}
							alt="Sales Experience Logo"
							width="180"
						/>
					</Section>

					<Text style={h1}>Sicherheitscode zur PIN-Zurücksetzung</Text>

					<Text style={text}>Hallo {firstName},</Text>
					<Text style={text}>
						Du hast eine Zurücksetzung Deiner 6-stelligen PIN für die Sales Experience angefordert.
						Bitte verwende den folgenden Code zur Bestätigung Deiner Identität:
					</Text>

					<Section style={codeContainer}>
						<Text style={codeText}>{code}</Text>
					</Section>

					<Text style={text}>
						Dieser Code ist für 10 Minuten gültig. Gib ihn auf der Setup-Seite ein, um Deine Identität zu verifizieren.
					</Text>

					<Hr style={hr} />

					<Text style={footer}>
						Diese E-Mail wurde nach einer Anfrage im Setup gesendet. Falls Du dies nicht veranlasst hast, kannst Du diese E-Mail einfach ignorieren oder Dich an einen Administrator wenden.
					</Text>
					<Text style={{
						...footer,
						marginTop: '8px',
					}}>
						&copy; {new Date().getFullYear()} buffinteractive.net für Deutsche Telekom Service GmbH |{' '}
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

export default PinResetEmail;
