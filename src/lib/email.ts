import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { GoodbyeEmail } from '@/emails/GoodbyeEmail';
import { VerificationEmail } from '@/emails/VerificationEmail';
import { render } from '@react-email/render';
import React from 'react';

// Use a fallback if ENV is not set (so the build doesn't crash)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.EMAIL_FROM || 'admin@sales-helper.de';

export const sendWelcomeEmail = async (
    to: string,
    role: string,
    tempPassword?: string
) => {
    if (!resend) {
        console.warn('RESEND_API_KEY is not set. Skipping welcome email to', to);
        return;
    }

    // Define the login URL (assuming Next.js absolute URL is needed, we'll try to build it)
    // Fallback to a hardcoded typical dev url if window/process.env isn't providing a host
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/login`;

    try {
        const htmlContent = await render(
            React.createElement(WelcomeEmail, {
                email: to,
                role,
                tempPassword,
                loginUrl,
                appUrl,
            })
        );

        const data = await resend.emails.send({
            from: `Sales Experience <${fromEmail}>`,
            to: [to],
            subject: 'Dein Account wurde erstellt',
            html: htmlContent,
        });

        console.log('Account email sent successfully', data);
        return data;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Be silent to not break the user creation flow if mail fails
    }
};

export const sendGoodbyeEmail = async (to: string) => {
    if (!resend) {
        console.warn('RESEND_API_KEY is not set. Skipping goodbye email to', to);
        return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
        const htmlContent = await render(
            React.createElement(GoodbyeEmail, { email: to, appUrl })
        );

        const data = await resend.emails.send({
            from: `Sales Experience <${fromEmail}>`,
            to: [to],
            subject: 'Dein Profil wurde entfernt',
            html: htmlContent,
        });

        console.log('Goodbye email sent successfully', data);
        return data;
    } catch (error) {
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
        const htmlContent = await render(
            React.createElement(VerificationEmail, {
                firstName,
                verificationLink,
                appUrl,
            })
        );

        const data = await resend.emails.send({
            from: `Sales Experience <${fromEmail}>`,
            replyTo: 'hello@flxk.nz',
            to: [to],
            subject: 'Sales Experience Bestätigung',
            html: htmlContent,
        });

        console.log('Verification email sent successfully', data);
        return data;
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};
