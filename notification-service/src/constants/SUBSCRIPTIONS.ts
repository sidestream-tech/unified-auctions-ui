import axios from 'axios';
import { EventSubscription } from '../types';
import { ETHERSCAN_API_KEY, ETHEREUM_NETWORK } from '../variables';
import { getEtherscanAPI } from './NETWORKS';

export async function getAbiFromContractAddress(contract: string) {
    if (!ETHERSCAN_API_KEY) {
        throw new Error('subscriptions: please set a valid ETHERSCAN_API_KEY, in the environment files');
    }
    const result = await axios.get(
        `${getEtherscanAPI(
            ETHEREUM_NETWORK
        )}/api?module=contract&action=getabi&address=${contract}&apikey=${ETHERSCAN_API_KEY}`
    );
    return JSON.parse(result.data.result);
}

export const SUBSCRIPTIONS: EventSubscription[] = [
    {
        id: 'ChainlogUpdateVersion',
        contract: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
        eventNames: ['UpdateVersion'],
    },
    /*{
        id: 'MCD_DAI',
        contract: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        eventNames: ['*'],
    },*/
];

export function getSubscriptionById(id: string) {
    return SUBSCRIPTIONS.find(eventSubscription => eventSubscription.id == id);
}
