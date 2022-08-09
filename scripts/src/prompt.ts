import { PromptObject } from 'prompts';

export const PROMPT_QUESTIONS: PromptObject[] = [
    {
        type: 'select',
        name: 'value',
        message: 'In which timeframe should we scan the blockchain?',
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
];
