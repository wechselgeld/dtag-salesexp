import {
	Resend,
} from 'resend';
import {
	render,
} from '@react-email/render';
import React from 'react';
import {
	VerificationEmail,
} from '@/emails/VerificationEmail';
import {
	WelcomeEmail,
} from '@/emails/WelcomeEmail';
import {
	GoodbyeEmail,
} from '@/emails/GoodbyeEmail';

// Use a fallback if ENV is not set (so the build doesn't crash)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.EMAIL_FROM || 'info@dtag.prod.mailer.flxk.nz';
const feedbackRecipient = process.env.FEEDBACK_RECIPIENT_EMAIL || 'hello@flxk.nz';

export const sendWelcomeEmail = async (
	to: string,
	role: string,
	tempPassword?: string,
) => {
	if (!resend) {
		console.warn('RESEND_API_KEY is not set. Skipping welcome email to', to);
		return;
	}

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	const loginUrl = `${appUrl}/login`;

	try {
		const element = React.createElement(WelcomeEmail, {
			email: to,
			role,
			tempPassword,
			loginUrl,
			appUrl,
		});
		const htmlContent = await render(element);
		const textContent = await render(element, {
			plainText: true,
		});

		const data = await resend.emails.send({
			from: `Sales Experience <${fromEmail}>`,
			to: [
				to,
			],
			subject: 'Dein Account wurde erstellt',
			html: htmlContent,
			text: textContent,
		});

		console.log('Account email sent successfully', data);
		return data;
	}
	catch (error) {
		console.error('Error sending welcome email:', error);
	}
};

export const sendGoodbyeEmail = async (to: string) => {
	if (!resend) {
		console.warn('RESEND_API_KEY is not set. Skipping goodbye email to', to);
		return;
	}

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

	try {
		const element = React.createElement(GoodbyeEmail, {
			email: to,
			appUrl,
		});
		const htmlContent = await render(element);
		const textContent = await render(element, {
			plainText: true,
		});

		const data = await resend.emails.send({
			from: `Sales Experience <${fromEmail}>`,
			to: [
				to,
			],
			subject: 'Dein Profil wurde entfernt',
			html: htmlContent,
			text: textContent,
		});

		console.log('Goodbye email sent successfully', data);
		return data;
	}
	catch (error) {
		console.error('Error sending goodbye email:', error);
	}
};

export const sendVerificationEmail = async (to: string, firstName: string, token: string) => {
	if (!resend) {
		console.warn('RESEND_API_KEY is not set. Skipping verification email to', to);
		return;
	}

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	const verificationLink = `${appUrl}/verify/${token}`;

	try {
		const element = React.createElement(VerificationEmail, {
			firstName,
			verificationLink,
			appUrl,
		});
		const htmlContent = await render(element);
		const textContent = await render(element, {
			plainText: true,
		});

		const data = await resend.emails.send({
			from: `Sales Experience <${fromEmail}>`,
			replyTo: 'hello@flxk.nz',
			to: [
				to,
			],
			subject: 'Sales Experience Bestätigung',
			html: htmlContent,
			text: textContent,
		});

		console.log('Verification email sent successfully', data);
		return data;
	}
	catch (error) {
		console.error('Error sending verification email:', error);
	}
};

export const sendFeedbackEmail = async (data: {
	text: string;
	userEmail?: string;
	userName?: string;
	files?: { name: string; content: string }[];
}) => {
	if (!resend) {
		console.warn('RESEND_API_KEY is not set. Skipping feedback email.');
		return;
	}

	try {
		// Basic HTML for feedback if no template exists yet
		const htmlContent = `
			<div style="font-family: sans-serif; padding: 20px;">
				<h2 style="color: #e20074;">Neues Feedback erhalten</h2>
				<p><strong>Von:</strong> ${data.userName || 'Unbekannt'} (${data.userEmail || 'Keine E-Mail'})</p>
				<hr />
				<p style="white-space: pre-wrap;">${data.text}</p>
				${data.files && data.files.length > 0 ? `
					<hr />
					<p><strong>Anhänge:</strong> ${data.files.length}</p>
					<ul>
						${data.files.map(f => `<li>${f.name}</li>`).join('')}
					</ul>
				` : ''}
			</div>
		`;

		const res = await resend.emails.send({
			from: `Sales Experience <${fromEmail}>`,
			to: [
				feedbackRecipient,
			],
			subject: `Feedback von ${data.userName || 'Nutzer'}`,
			html: htmlContent,
			attachments: data.files?.map(f => ({
				filename: f.name,
				content: f.content,
			})),
		});

		return res;
	}
	catch (error) {
		console.error('Error sending feedback email:', error);
		throw error;
	}
};
