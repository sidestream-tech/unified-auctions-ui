import prompts, { PromptObject } from 'prompts';
import { ARROW_EMOJI, CALENDAR_EMOJI, EVENT_EMOJI } from './variables';

const PROMPT_QUESTIONS: PromptObject[] = [
    {
        type: 'select',
        name: 'time',
        message: `${CALENDAR_EMOJI} For which timeframe would you like to export the event data?`,
        choices: [
            {
                title: 'No time limit',
                description: 'Return all events',
                value: '0',
            },
            {
                title: '1 Month',
                description: 'Only return the events found in the last month',
                value: '1',
            },
            {
                title: '3 Months',
                description: 'Only return the events found in the last 3 months',
                value: '3',
            },
            {
                title: '6 Months',
                description: 'Only return the events found in the last 6 months',
                value: '6',
            },
            {
                title: '12 Months',
                description: 'Only return the events found in the last 12 months',
                value: '12',
            },
        ],
        initial: 0,
    },
    {
        type: 'toggle',
        name: 'setFileName',
        message: 'Would you like to set a custom filename?',
        initial: false,
        active: 'yes',
        inactive: 'no',
    },
    {
        type: prev => (prev === true ? 'text' : null),
        name: 'filename',
        message: 'Please enter your custom filename',
    },
];

export const setupPrompts = async function (): Promise<{
    dateLimit: Date | undefined;
    fileName: string | undefined;
}> {
    const response = await prompts(PROMPT_QUESTIONS);

    const dateLimit =
        response.time && response.time !== '0'
            ? new Date(new Date().getFullYear(), new Date().getMonth() - response.time, new Date().getDate())
            : undefined;

    if (dateLimit) {
        console.info(`${ARROW_EMOJI}${EVENT_EMOJI} Fetching all events after ${dateLimit.toDateString()}`);
    } else {
        console.info(`${ARROW_EMOJI}${EVENT_EMOJI} Fetching all events`);
    }

    return { dateLimit, fileName: response.filename || undefined };
};
