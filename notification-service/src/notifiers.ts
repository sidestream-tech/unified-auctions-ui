import { notifyPerMail, setupMailer } from './notifiers/mailer';
import { EventData, Notifiers } from './types';
import { EVENT_PREFIX } from './constants/PREFIXES';
import { getReceiversByType, getReceiversForSubscriptionId } from './recievers';
import { notifyPerDiscord } from './notifiers/discord';

export async function setupNotifiers(): Promise<Notifiers> {
    // Go through all notifiers and set them up
    const mailer = await setupMailer();

    return {
        mailer: mailer,
    };
}

export function notify(network: string, notifiers: Notifiers, eventData: EventData) {
    console.info(
        `${EVENT_PREFIX} "${eventData.eventSubscription.id}" triggered in block "${eventData.event.blockNumber}"`
    );

    const receivers = getReceiversForSubscriptionId(eventData.eventSubscription.id);

    // Notify per mail
    notifyPerMail(network, notifiers.mailer, eventData, getReceiversByType(receivers, 'email')).catch(error =>
        console.error(error)
    );
    // Notify per discord
    notifyPerDiscord(network, eventData, getReceiversByType(receivers, 'discord')).catch(error => {
        console.error(error);
    });
}
