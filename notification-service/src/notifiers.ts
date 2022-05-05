import { notifyPerMail, setupMailer } from './notifiers/mailer';
import { EventData, Notifiers } from './types';
import { EVENT_PREFIX } from './constants/PREFIXES';
import { getReceiversByType, getReceiversForSubscriptionId } from './recievers';

export async function setupNotifiers(): Promise<Notifiers> {
    // Go through all notifiers and set them up
    const mailer = await setupMailer();

    return {
        mailer: mailer,
    };
}

export function notify(notifiers: Notifiers, eventData: EventData) {
    console.info(
        `${EVENT_PREFIX} "${eventData.eventSubscription.id}" triggered in block "${eventData.event.blockNumber}"`
    );

    const receivers = getReceiversForSubscriptionId(eventData.eventSubscription.id);

    // Notify per mail
    notifyPerMail(notifiers.mailer, eventData, getReceiversByType(receivers, 'email')).catch(error =>
        console.error(error)
    );
}
