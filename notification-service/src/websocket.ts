import { ethers } from 'ethers';
import { INFURA_PROJECT_ID, ETHEREUM_NETWORK } from './variables';
import { SUBSCRIPTIONS } from './constants/SUBSCRIPTIONS';
import { EVENT_PREFIX, WEBSOCKET_PREFIX } from './constants/PREFIXES';

export function setupWebSocket(): ethers.providers.WebSocketProvider {
    if (!INFURA_PROJECT_ID) {
        throw new Error(`${WEBSOCKET_PREFIX} please set a valid infura project id, in the environment files.`);
    }
    const wsProvider = new ethers.providers.WebSocketProvider(
        `wss://${ETHEREUM_NETWORK}.infura.io/ws/v3/${INFURA_PROJECT_ID}`,
        ETHEREUM_NETWORK
    );

    console.info(`${WEBSOCKET_PREFIX} websocket connection opened with network "${ETHEREUM_NETWORK}"`);
    return wsProvider;
}

export function subscribe(
    wsProvider: ethers.providers.WebSocketProvider,
    sendMail: (mailData: { eventName: string; contractAddress: string; transactionHash: string }) => void
) {
    SUBSCRIPTIONS.map(subscription => {
        const contract = new ethers.Contract(subscription.contract, subscription.abi, wsProvider);

        subscription.eventNames.map(eventName => {
            console.info(
                `${WEBSOCKET_PREFIX} listening for event "${eventName}" on contract "${subscription.contract}"`
            );
            contract.on(eventName, event => {
                console.info(
                    `${EVENT_PREFIX} event "${event.event}" triggered in block "${event.blockNumber}". Attempting to send email.`
                );
                sendMail({
                    eventName: event.event,
                    contractAddress: subscription.contract,
                    transactionHash: event.transactionHash,
                });
            });
        });
    });
}
