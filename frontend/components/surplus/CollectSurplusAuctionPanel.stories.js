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
            userWalletAddress: fakeSurplusAuction.receiverAddress,
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
            userWalletAddress: fakeFinishedSurplusAuction.receiverAddress,
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
            userWalletAddress: fakeCollectedSurplusAuction.receiverAddress,
        }),
    }))
    .add('Collecting', () => ({
        ...common,
        data: () => ({
            auction: fakeFinishedSurplusAuction,
            userWalletAddress: fakeFinishedSurplusAuction.receiverAddress,
            isCollecting: true,
        }),
    }));
