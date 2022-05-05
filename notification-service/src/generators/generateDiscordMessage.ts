import { EventSubscription } from '../types';
import { formatEtherscanLink } from '../etherscan';
import { POWERED_BY, POWERED_BY_LINK } from '../variables';

export function generateDiscordMessage(
    network: string,
    eventSubscription: EventSubscription,
    event: any,
    formattedData: string
) {
    return {
        embeds: [
            {
                author: {
                    name: POWERED_BY,
                    url: POWERED_BY_LINK,
                },
                title: `${eventSubscription.id} has been triggered`,
                url: formatEtherscanLink(network, 'tx', event.transactionHash),
                color: 15258703,
                fields: [
                    {
                        name: 'Network:',
                        value: `${network}`,
                        inline: true,
                    },
                    {
                        name: 'Contract Address:',
                        value: `[${eventSubscription.address}](${formatEtherscanLink(
                            network,
                            'address',
                            eventSubscription.address
                        )})`,
                        inline: true,
                    },
                    {
                        name: 'Updated Values:',
                        value: formattedData,
                    },
                ],
            },
        ],
    };
}
