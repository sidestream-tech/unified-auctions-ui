import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import SurplusAuctionTransaction from './SurplusAuctionTransaction';
import { generateFakeSurplusAuctionTransaction } from '~/helpers/generateFakeSurplusAuction';

const common = {
    components: { SurplusAuctionTransaction },
};

storiesOf('Surplus/SurplusAuctionTransaction', module)
    .add('Just started', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuctionTransaction('just-started'),
        }),
        template: '<SurplusAuctionTransaction :auction="auction" />',
    }))
    .add('Has Bids', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuctionTransaction('have-bids'),
        }),
        template: '<SurplusAuctionTransaction :auction="auction" />',
    }))
    .add('Has Bids, wallet connected', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuctionTransaction('have-bids'),
            walletAddress: faker.finance.ethereumAddress(),
        }),
        template: '<SurplusAuctionTransaction :auction="auction" :wallet-address="walletAddress" />',
    }))
    .add('Ready for collection', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuctionTransaction('ready-for-collection'),
        }),
        template: '<SurplusAuctionTransaction :auction="auction" />',
    }))
    .add('Requires Restart', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuctionTransaction('requires-restart'),
        }),
        template: '<SurplusAuctionTransaction :auction="auction" />',
    }))
    .add('Collected', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuctionTransaction('collected'),
        }),
        template: '<SurplusAuctionTransaction :auction="auction" />',
    }));
