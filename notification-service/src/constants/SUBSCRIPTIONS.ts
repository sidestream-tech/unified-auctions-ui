import { EventSubscription } from '../types';
import CHAINLOG_ABI from '../abis/CHAINLOG.json';
import MCD_DAI_ABI from '../abis/MCD_DAI.json';

export const SUBSCRIPTIONS: EventSubscription[] = [
    {
        id: 'ChainlogUpdateVersion',
        contract: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
        abi: CHAINLOG_ABI,
        eventNames: ['UpdateVersion'],
        generateText: (latestEvent, previousEvent) => `New: ${latestEvent}; Previous Event: ${previousEvent}`,
    },
    {
        id: 'MCD_DAI',
        contract: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        abi: MCD_DAI_ABI,
        eventNames: ['*'],
        generateText: (latestEvent, previousEvent) => `New: ${latestEvent}; Previous Event: ${previousEvent}`,
    },
];
