import { EventSubscription } from '../types';
import { ethers } from 'ethers';

export const SUBSCRIPTIONS: EventSubscription[] = [
    {
        id: 'ChainLogUpdateAddress',
        address: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
        eventName: 'UpdateAddress',
        formatData: (event, formatEtherscanLink) => {
            return `> Key: ${ethers.utils.formatBytes32String(event.args.key)}<br />
                    > Address: [${event.args.addr}](${formatEtherscanLink('address', event.args.addr)})`;
        },
    },
];

export function getSubscriptionById(id: string) {
    return SUBSCRIPTIONS.find(eventSubscription => eventSubscription.id == id);
}
