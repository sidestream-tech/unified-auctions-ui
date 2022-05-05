import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface EventSubscription {
    id: string;
    address: string;
    eventName: string;
    formatData: (event: any, formatEtherscanLink: (type: string, content: string) => string) => string;
}

export interface EventData {
    event: any;
    eventSubscription: EventSubscription;
}

export interface Receiver {
    type: string;
    receiver: string;
    subscriptions: string[];
}

export interface MailData {
    receivers: string;
    subject: string;
    textBody: string;
    htmlBody: string;
}

export interface Notifiers {
    mailer: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | undefined;
}
