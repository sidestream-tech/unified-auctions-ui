import { EventData } from '../types';
import axios from 'axios';
import { generateDiscordMessage } from '../generators/generateDiscordMessage';
import { ETHEREUM_NETWORK } from '../variables';
import { formatEtherscanLink } from '../etherscan';

const DISCORD_PREFIX = '💬 [discord]:';

export async function notifyPerDiscord(eventData: EventData, receivers: string[]) {
    if (receivers.length <= 0) {
        return;
    }

    const formattedData = eventData.eventSubscription
        .formatData(eventData.event, (type, content) => formatEtherscanLink(ETHEREUM_NETWORK, type, content))
        .replace('<br />', '');

    const discordMessage = generateDiscordMessage(
        ETHEREUM_NETWORK,
        eventData.eventSubscription,
        eventData.event,
        formattedData
    );

    receivers.forEach(receiver => {
        try {
            axios.post(receiver, discordMessage);
        } catch (error) {
            console.error(`${DISCORD_PREFIX} error sending message: ${error}`);
        }
    });
}
