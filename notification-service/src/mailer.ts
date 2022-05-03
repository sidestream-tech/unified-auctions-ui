import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME } from './variables';

export async function setupMailer() {
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD) {
        console.warn('mailer: missing account data. using mock ethereal email.');

        // Generate Test Account for development
        const testAccount = await nodemailer.createTestAccount();

        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: !(SMTP_PORT === 465), // true for 465, false for other ports
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_PASSWORD,
        },
    });
}

export async function sendMail(
    transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>,
    { subject, body }: { subject: string; body: string }
) {
    const info = await transporter.sendMail({
        from: '"Unified Auctions Notification Service" <foo@example.com>',
        to: 'bar@example.com, baz@example.com',
        subject: subject,
        html: body,
    });

    // Preview only available when sending through an Ethereal account
    const previewLink = nodemailer.getTestMessageUrl(info);
    if (previewLink) {
        console.info(`mailer: sent test mail: ${previewLink}`);
    }
}
