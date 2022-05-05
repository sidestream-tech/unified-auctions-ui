import { EventSubscription } from '../types';
import { formatEtherscanLink } from '../etherscan';

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
                    name: 'Unified Auctions Service',
                    url: 'https://github.com/sidestream-tech/unified-auctions-ui',
                    icon_url: 'https://i.imgur.com/nMmBaXj.png',
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
