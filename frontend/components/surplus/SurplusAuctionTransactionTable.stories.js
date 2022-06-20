import { storiesOf } from '@storybook/vue';
import SurplusAuctionTransactionTable from '~/components/surplus/SurplusAuctionTransactionTable';
import { generateFakeSurplusBidEvents } from '~/helpers/generateFakeSurplusEvent';

const fakeSurplusEvents = [...generateFakeSurplusBidEvents(10)];

const common = {
    components: { SurplusAuctionTransactionTable },
    data: () => ({
        events: fakeSurplusEvents,
        userWalletAddress: fakeSurplusEvents[8].address,
    }),
};

storiesOf('Surplus/SurplusAuctionTransactionTable', module)
    .add('Over 5 Events', () => ({
        ...common,
        template: `<SurplusAuctionTransactionTable :events="events" :userWalletAddress="userWalletAddress" />`,
    }))
    .add('5 Events and under', () => ({
        ...common,
        data: () => ({
            events: generateFakeSurplusBidEvents(5),
            userWalletAddress: fakeSurplusEvents[0].address,
        }),
        template: `<SurplusAuctionTransactionTable :events="events" :userWalletAddress="userWalletAddress" />`,
    }))
    .add('No Data', () => ({
        ...common,
        template: `<SurplusAuctionTransactionTable />`,
    }))
    .add('Empty Events array', () => ({
        ...common,
        template: `<SurplusAuctionTransactionTable :events="[]" />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `<SurplusAuctionTransactionTable :isLoading="true" />`,
    }))
    .add('Error', () => ({
        ...common,
        template: `<SurplusAuctionTransactionTable error="Error while retrieving events." />`,
    }));
