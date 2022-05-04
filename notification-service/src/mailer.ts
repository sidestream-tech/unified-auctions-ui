import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { SMTP_EMAIL, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME } from './variables';
import { MAIL_PREFIX } from './constants/PREFIXES';
import generateEmail, { generateTextEmail } from './helpers/generateEmail';
import { getEtherscanURL } from './constants/NETWORKS';
import validator from 'validator';
import { getReceiversForSubscriptionId } from './recievers';
import { MailData } from './types';

export async function setupMailer() {
    if (!SMTP_EMAIL) {
        throw new Error('mailer: please specify an outgoing email address in "SMTP_EMAIL"');
    }
    if (!validator.isEmail(SMTP_EMAIL)) {
        throw new Error(`mailer: the SMTP_EMAIL "${SMTP_EMAIL}" is not a valid email address`);
    }
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD) {
        console.warn(`${MAIL_PREFIX} missing account data. using mock ethereal email.`);

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

    console.info(`${MAIL_PREFIX} setting up custom mailing service`);
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_PASSWORD,
        },
    });
}

export async function sendMail(
    transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>,
    network: string,
    mailData: MailData
) {
    const etherscanURL = `${getEtherscanURL(network)}/tx/${mailData.transactionHash}#eventlog`;
    const receivers = getReceiversForSubscriptionId(mailData.subscriptionId);

    if (!receivers) {
        return;
    }

    const info = await transporter.sendMail({
        from: SMTP_EMAIL,
        to: receivers,
        subject: `[${network.toUpperCase()}] Event "${mailData.eventName}" has been updated`,
        text: generateTextEmail(mailData.eventName, mailData.contractAddress, etherscanURL, network),
        html: generateEmail(mailData.eventName, mailData.contractAddress, etherscanURL, network),
    });

    // Preview only available when sending through an Ethereal account
    const previewLink = nodemailer.getTestMessageUrl(info);
    if (previewLink) {
        console.info(`${MAIL_PREFIX} sent test mail: ${previewLink}`);
    }
}
