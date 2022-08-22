import { PromptObject } from 'prompts';

export type KnownConfigs = 'causeDebt';

export declare interface Configuration {
    title: string;
    configuration: PromptObject[];
}

export type ConfigConfigurations = Record<KnownConfigs, Configuration>;

const CONFIGURATIONS: ConfigConfigurations = {
    causeDebt: {
        title: 'Simulate Debt Auction',
        configuration: [
            {
                type: 'text',
                name: 'network',
                message: 'Network',
                initial: 'custom',
            },
            {
                type: 'text',
                name: 'debtAmountDai',
                message: 'Protocol Debt In Dai',
                initial: '10',
            },
            {
                type: 'text',
                name: 'mkrOnAuction',
                message: 'Initially sold MKR auction',
                initial: '1000',
            },
            {
                type: 'text',
                name: 'daiOnAuction',
                message: 'Dai requested by auction',
                initial: '1000',
            },
        ],
    },
};

export default CONFIGURATIONS;
