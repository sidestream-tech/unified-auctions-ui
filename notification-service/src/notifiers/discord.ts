import { EventData } from '../types';
import axios from 'axios';
import { generateDiscordMessage } from '../generators/generateDiscordMessage';
import { formatEtherscanLink } from '../etherscan';

const DISCORD_PREFIX = '💬 [discord]:';

export async function notifyPerDiscord(network: string, eventData: EventData, receivers: string[]) {
    if (receivers.length <= 0) {
        return;
    }

    const formattedData = eventData.eventSubscription
        .formatData(eventData.event, (type, content) => formatEtherscanLink(network, type, content))
        .replace('<br />', '');

    const discordMessage = generateDiscordMessage(
        network,
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
