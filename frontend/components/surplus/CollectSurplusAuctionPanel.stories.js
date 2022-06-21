import { storiesOf } from '@storybook/vue';
import CollectSurplusAuctionPanel from '~/components/surplus/CollectSurplusAuctionPanel';
import { generateFakeSurplusAuction } from '~/helpers/generateFakeSurplusAuction';

const fakeSurplusAuction = generateFakeSurplusAuction('have-bids');
const fakeFinishedSurplusAuction = generateFakeSurplusAuction('ready-for-collection');
const fakeCollectedSurplusAuction = generateFakeSurplusAuction('collected');

const common = {
    components: { CollectSurplusAuctionPanel },
    template: `
    <CollectSurplusAuctionPanel 
        v-bind="$data"
    />
    `,
};

storiesOf('Surplus/CollectSurplusAuctionPanel', module)
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
            userWalletAddress: fakeSurplusAuction.events[fakeSurplusAuction.events.length - 1].address,
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
            userWalletAddress: fakeFinishedSurplusAuction.events[fakeFinishedSurplusAuction.events.length - 1].address,
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
            userWalletAddress:
                fakeCollectedSurplusAuction.events[fakeCollectedSurplusAuction.events.length - 2].address,
        }),
    }))
    .add('Collecting', () => ({
        ...common,
        data: () => ({
            auction: fakeFinishedSurplusAuction,
            userWalletAddress: fakeFinishedSurplusAuction.events[fakeFinishedSurplusAuction.events.length - 1].address,
            isCollecting: true,
        }),
    }));
