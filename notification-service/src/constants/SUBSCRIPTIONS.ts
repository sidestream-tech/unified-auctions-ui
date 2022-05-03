import { EventSubscription } from '../types';
import CHAINLOG_ABI from '../abis/CHAINLOG.json';

export const SUBSCRIPTIONS: EventSubscription[] = [
    {
        id: 'ChainlogUpdateVersion',
        contract: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
        abi: CHAINLOG_ABI,
        eventName: 'UpdateVersion',
        generateText: (latestEvent, previousEvent) => `New: ${latestEvent}; Previous Event: ${previousEvent}`,
    },
];
