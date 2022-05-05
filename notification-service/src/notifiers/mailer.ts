import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import validator from 'validator';
import * as showdown from 'showdown';
import { ETHEREUM_NETWORK, SMTP_EMAIL, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME } from '../variables';
import { EventData, MailData } from '../types';
import { formatEtherscanLink } from '../etherscan';
import generateEmailHTMLBody, { generateEmailSubject, generateEmailTextBody } from '../generators/generateEmail';

const converter = new showdown.Converter();
const MAIL_PREFIX = '📧 [mailer]:';

export async function setupMailer() {
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD) {
        console.warn(`${MAIL_PREFIX} skipping mailer setup. Missing account data.`);
        return;
    }

    if (!SMTP_EMAIL) {
        console.warn(`${MAIL_PREFIX} skipping mailer setup. Please specify an outgoing email address in "SMTP_EMAIL"`);
        return;
    }
    if (!validator.isEmail(SMTP_EMAIL)) {
        console.warn(
            `${MAIL_PREFIX} skipping mailer setup. The SMTP_EMAIL "${SMTP_EMAIL}" is not a valid email address`
        );
        return;
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USERNAME,
            pass: SMTP_PASSWORD,
        },
    });

    transporter.verify(function (error) {
        if (error) {
            throw new Error(`Error setting up mailer. Error: ${error}`);
        } else {
            console.info(`${MAIL_PREFIX} mailer was successfully set up`);
        }
    });
    return transporter;
}

async function sendMail(transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>, mailData: MailData) {
    await transporter.sendMail({
        from: SMTP_EMAIL,
        to: mailData.receivers,
        subject: mailData.subject,
        text: mailData.textBody,
        html: mailData.htmlBody,
    });
}

export function validateEmailReceivers(receivers: string[]) {
    const invalidEmails: string[] = [];

    receivers.forEach(receiver => {
        if (!validator.isEmail(receiver)) {
            invalidEmails.push(receiver);
        }
    });
    if (invalidEmails.length > 0) {
        throw new Error(`receivers: invalid emails found for "${invalidEmails.toString()}"`);
    }
}

export async function notifyPerMail(
    transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | undefined,
    eventData: EventData,
    receivers: string[]
) {
    if (!transporter) {
        console.warn(`${MAIL_PREFIX} cannot send email notification. Missing account data.`);
        return;
    }
    if (receivers.length <= 0) {
        return;
    }

    const formattedData = converter.makeHtml(
        eventData.eventSubscription.formatData(eventData.event, (type, content) =>
            formatEtherscanLink(ETHEREUM_NETWORK, type, content)
        )
    );

    const emailSubject = generateEmailSubject(ETHEREUM_NETWORK, eventData.eventSubscription.id);
    const emailTextBody = generateEmailTextBody(ETHEREUM_NETWORK, eventData.eventSubscription);
    const emailHTMLBody = generateEmailHTMLBody(
        ETHEREUM_NETWORK,
        eventData.eventSubscription,
        eventData.event,
        formattedData
    );

    const mailData: MailData = {
        receivers: receivers.toString(),
        subject: emailSubject,
        textBody: emailTextBody,
        htmlBody: emailHTMLBody,
    };

    await sendMail(transporter, mailData);
}
