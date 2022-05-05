import { EventSubscription } from '../types';
import { ethers } from 'ethers';

export const SUBSCRIPTIONS: EventSubscription[] = [
    {
        id: 'ChainLogUpdateAddress',
        address: '0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F',
        eventName: 'UpdateAddress',
        formatData: (event, formatEtherscanLink) => {
            return `
                Key: ${ethers.utils.formatBytes32String(event.args.key)}<br /> 
                Address: <a href="${formatEtherscanLink(
                    'address',
                    event.args.addr
                )}" target="_blank" style="color: lightblue;">${event.args.addr}</a>
            `;
        },
    },
    {
        id: 'MCD_DAI_Transfer',
        address: '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        eventName: 'Transfer',
        formatData: (event, formatEtherscanLink) => {
            return `
                From: <a href="${formatEtherscanLink(
                    'address',
                    event.args.src
                )}" target="_blank" style="color: lightblue;">${event.args.src}</a><br />
                To: <a href="${formatEtherscanLink(
                    'address',
                    event.args.dst
                )}" target="_blank" style="color: lightblue;">${event.args.dst}</a>
            `;
        },
    },
];

export function getSubscriptionById(id: string) {
    return SUBSCRIPTIONS.find(eventSubscription => eventSubscription.id == id);
}
