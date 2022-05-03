import { ethers } from 'ethers';
import { INFURA_PROJECT_ID, ETHEREUM_NETWORK } from './variables';
import { SUBSCRIPTIONS } from './constants/SUBSCRIPTIONS';

export function setupWebSocket(): ethers.providers.WebSocketProvider {
    if (!INFURA_PROJECT_ID) {
        throw new Error('websocket: please set a valid infura project id, in the environment files.');
    }
    const wsProvider = new ethers.providers.WebSocketProvider(
        `wss://${ETHEREUM_NETWORK}.infura.io/ws/v3/${INFURA_PROJECT_ID}`,
        ETHEREUM_NETWORK
    );

    console.info(`websocket: websocket connection opened with network "${ETHEREUM_NETWORK}"`);
    return wsProvider;
}

export function subscribe(
    wsProvider: ethers.providers.WebSocketProvider,
    sendMail: (subject: string, body: string) => void
) {
    SUBSCRIPTIONS.map(subscription => {
        const contract = new ethers.Contract(subscription.contract, subscription.abi, wsProvider);
        console.info(
            `websocket: listening for event "${subscription.eventName}" on contract "${subscription.contract}"`
        );
        contract.on(subscription.eventName, () => {
            sendMail(`Test`, `Test`);
        });
    });
}
