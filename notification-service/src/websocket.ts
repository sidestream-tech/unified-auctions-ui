import { ethers } from 'ethers';
import { INFURA_PROJECT_ID, ETHEREUM_NETWORK } from './variables';
import { getAbiFromContractAddress, SUBSCRIPTIONS } from './constants/SUBSCRIPTIONS';
import { EVENT_PREFIX, WEBSOCKET_PREFIX } from './constants/PREFIXES';
import { EventSubscription, MailData } from './types';

export function setupWebSocket(): ethers.providers.WebSocketProvider {
    if (!INFURA_PROJECT_ID) {
        throw new Error(`${WEBSOCKET_PREFIX} please set a valid INFURA_PROJECT_ID, in the environment files`);
    }
    const wsProvider = new ethers.providers.WebSocketProvider(
        `wss://${ETHEREUM_NETWORK}.infura.io/ws/v3/${INFURA_PROJECT_ID}`,
        ETHEREUM_NETWORK
    );

    console.info(`${WEBSOCKET_PREFIX} websocket connection opened with network "${ETHEREUM_NETWORK}"`);
    return wsProvider;
}

export function subscribe(wsProvider: ethers.providers.WebSocketProvider, sendMail: (mailData: MailData) => void) {
    const contracts: Record<string, EventSubscription[]> = {};

    SUBSCRIPTIONS.forEach(eventSubscription => {
        if (!contracts[eventSubscription.contract]) {
            contracts[eventSubscription.contract] = [eventSubscription];
        } else {
            contracts[eventSubscription.contract].push(eventSubscription);
        }
    });

    Object.keys(contracts).forEach(async contractAddress => {
        const contractAbi = await getAbiFromContractAddress(contractAddress);
        const contract = new ethers.Contract(contractAddress, contractAbi, wsProvider);

        console.info(
            `${WEBSOCKET_PREFIX} registered websocket on contract "${contractAddress}" for ${contracts[contractAddress].length} event(s)`
        );
        contract.on('*', event => {
            contracts[contractAddress].forEach(eventSubscription => {
                if (event.event === eventSubscription.eventName) {
                    console.info(
                        `${EVENT_PREFIX} event "${event.event}" triggered in block "${event.blockNumber}". Attempting to send email.`
                    );
                    sendMail({
                        eventSubscription: eventSubscription,
                        eventData: event,
                        formattedData: eventSubscription.formatData(event),
                    });
                }
            });
        });
    });
}
