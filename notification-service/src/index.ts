import 'dotenv/config';
import { sendMail, setupMailer } from './mailer';
import { setupWebSocket, subscribe } from './websocket';
import { isNetworkSupported } from './constants/NETWORKS';
import { ETHEREUM_NETWORK } from './variables';
import { setupReceiverList } from './recievers';

const start = async function () {
    isNetworkSupported(ETHEREUM_NETWORK);
    setupReceiverList();
    const transporter = await setupMailer();
    const wsProvider = setupWebSocket();

    subscribe(wsProvider, mailData => sendMail(transporter, ETHEREUM_NETWORK, mailData));
};

start().catch(error => {
    throw error;
});
