import 'dotenv/config';
import { ETHEREUM_NETWORK } from './variables';
import { listenForEvents, setupWebSocket } from './websocket';
import { isNetworkSupported } from './constants/NETWORKS';
import { validateReceiverList } from './recievers';
import { validateEtherscanAPIKey } from './etherscan';
import { notify, setupNotifiers } from './notifiers';

const start = async function () {
    isNetworkSupported(ETHEREUM_NETWORK);
    validateEtherscanAPIKey();
    validateReceiverList();

    const notifiers = await setupNotifiers();
    const wsProvider = await setupWebSocket();

    listenForEvents(wsProvider, eventData => notify(notifiers, eventData));
};

start().catch(error => {
    throw error;
});
