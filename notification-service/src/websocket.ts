import { ethers } from 'ethers';
import { INFURA_PROJECT_ID, ETHEREUM_NETWORK } from './variables';
import { SUBSCRIPTIONS } from './constants/SUBSCRIPTIONS';
import { WEBSOCKET_PREFIX } from './constants/PREFIXES';
import { EventData, EventSubscription } from './types';
import { getAbiFromContractAddress } from './etherscan';

export async function setupWebSocket(): Promise<ethers.providers.WebSocketProvider> {
    if (!INFURA_PROJECT_ID) {
        throw new Error(`${WEBSOCKET_PREFIX} please set a valid INFURA_PROJECT_ID, in the environment files`);
    }

    const wsProvider = new ethers.providers.WebSocketProvider(
        `wss://${ETHEREUM_NETWORK}.infura.io/ws/v3/${INFURA_PROJECT_ID}`,
        ETHEREUM_NETWORK
    );

    await wsProvider.getNetwork();

    console.info(`${WEBSOCKET_PREFIX} websocket connection opened to "${ETHEREUM_NETWORK}" network`);
    return wsProvider;
}

export function listenForEvents(
    wsProvider: ethers.providers.WebSocketProvider,
    triggerEvent: (eventData: EventData) => void
) {
    const contracts: Record<string, EventSubscription[]> = {};

    SUBSCRIPTIONS.forEach(eventSubscription => {
        if (!contracts[eventSubscription.address]) {
            contracts[eventSubscription.address] = [eventSubscription];
        } else {
            contracts[eventSubscription.address].push(eventSubscription);
        }
    });

    Object.keys(contracts).forEach(async contractAddress => {
        try {
            const contractAbi = await getAbiFromContractAddress(contractAddress);
            const contract = new ethers.Contract(contractAddress, contractAbi, wsProvider);
            const eventNames = contracts[contractAddress].map(eventSubscription => {
                return eventSubscription.eventName;
            });

            console.info(
                `${WEBSOCKET_PREFIX} subscribed to "${eventNames.toString()}" event(s) on "${contractAddress}" address`
            );
            contract.on('*', event => {
                contracts[contractAddress].forEach(eventSubscription => {
                    if (event.event === eventSubscription.eventName) {
                        triggerEvent({ eventSubscription: eventSubscription, event: event });
                    }
                });
            });
        } catch (error) {
            console.error(`${WEBSOCKET_PREFIX} failed to subscribe to "${contractAddress}" address. Error: ${error}`);
        }
    });
}
