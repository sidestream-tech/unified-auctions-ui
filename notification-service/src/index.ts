import 'dotenv/config';
import { sendMail, setupMailer } from './mailer';
import { setupWebSocket, subscribe } from './websocket';
import { isNetworkSupported } from './constants/NETWORKS';
import { ETHEREUM_NETWORK } from './variables';

const start = async function () {
    isNetworkSupported(ETHEREUM_NETWORK);
    const transporter = await setupMailer();
    const wsProvider = setupWebSocket();

    subscribe(wsProvider, (subject, body) => sendMail(transporter, { subject, body }));
};

start().catch(error => {
    throw error;
});
