import 'dotenv/config';
import { listenForEvents, setupWebSocket } from './websocket';
import { isNetworkSupported } from './constants/NETWORKS';
import { validateReceiverList } from './recievers';
import { validateEtherscanAPIKey } from './etherscan';
import { notify, setupNotifiers } from './notifiers';

const start = async function () {
    validateEtherscanAPIKey();
    validateReceiverList();

    const notifiers = await setupNotifiers();
    const { wsProvider, networkTitle } = await setupWebSocket();
    isNetworkSupported(networkTitle);
    listenForEvents(wsProvider, networkTitle, eventData => notify(notifiers, eventData));
};

start().catch(error => {
    throw error;
});
