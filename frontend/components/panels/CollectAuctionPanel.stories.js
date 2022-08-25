import { storiesOf } from '@storybook/vue';
import CollectAuctionPanel from './CollectAuctionPanel';
import { generateFakeSurplusAuction } from '~/helpers/generateFakeSurplusAuction';
import { generateFakeDebtAuction } from '~/helpers/generateFakeDebtAuction';

const fakeSurplusAuction = generateFakeSurplusAuction('have-bids');
const fakeDebtAuction = generateFakeDebtAuction('have-bids');
const fakeFinishedSurplusAuction = generateFakeSurplusAuction('ready-for-collection');
const fakeCollectedSurplusAuction = generateFakeSurplusAuction('collected');

const common = {
    components: { CollectAuctionPanel },
    template: `
    <CollectAuctionPanel 
        v-bind="$data"
    />
    `,
};

storiesOf('Panels/CollectAuctionPanel', module)
    .add('No bids yet', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuction('just-started'),
        }),
    }))
    .add('Has bids', () => ({
        ...common,
        data: () => ({
            auction: fakeSurplusAuction,
        }),
    }))
    .add('Has bids, user is highest bidder', () => ({
        ...common,
        data: () => ({
            auction: fakeSurplusAuction,
            walletAddress: fakeSurplusAuction.receiverAddress,
        }),
    }))
    .add('Ready for collection', () => ({
        ...common,
        data: () => ({
            auction: fakeFinishedSurplusAuction,
        }),
    }))
    .add('Ready for collection, user is highest bidder', () => ({
        ...common,
        data: () => ({
            auction: fakeFinishedSurplusAuction,
            walletAddress: fakeFinishedSurplusAuction.receiverAddress,
        }),
    }))
    .add('Collected', () => ({
        ...common,
        data: () => ({
            auction: generateFakeSurplusAuction('collected'),
        }),
    }))
    .add('Collected by user', () => ({
        ...common,
        data: () => ({
            auction: fakeCollectedSurplusAuction,
            walletAddress: fakeCollectedSurplusAuction.receiverAddress,
        }),
    }))
    .add('Collecting', () => ({
        ...common,
        data: () => ({
            auction: fakeFinishedSurplusAuction,
            walletAddress: fakeFinishedSurplusAuction.receiverAddress,
            isCollecting: true,
        }),
    }))
    .add('Debt Auction', () => ({
        ...common,
        data: () => ({
            auction: fakeDebtAuction,
            currency: 'MKR',
        }),
    }));
