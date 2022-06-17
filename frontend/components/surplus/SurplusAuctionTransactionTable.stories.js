import { storiesOf } from '@storybook/vue';
import SurplusAuctionTransactionTable from '~/components/surplus/SurplusAuctionTransactionTable';
import { generateFakeSurplusBidEvents, generateFakeSurplusEvent } from '~/helpers/generateFakeSurplusEvent';

const fakeSurplusEvents = [...generateFakeSurplusBidEvents(5)];

const common = {
    components: { SurplusAuctionTransactionTable },
    data: () => ({
        events: fakeSurplusEvents,
        userWalletAddress: fakeSurplusEvents[1].address,
    }),
};

storiesOf('Surplus/SurplusAuctionTransactionTable', module)
    .add('Default', () => ({
        ...common,
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
    .add('With Start and Collect Events', () => ({
        ...common,
        data: () => ({
            events: [generateFakeSurplusEvent('start'), ...fakeSurplusEvents, generateFakeSurplusEvent('collect')],
            userWalletAddress: fakeSurplusEvents[1].address,
        }),
        template: `<SurplusAuctionTransactionTable :events="events" :userWalletAddress="userWalletAddress" />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `<SurplusAuctionTransactionTable :isLoading="true" />`,
    }))
    .add('Error', () => ({
        ...common,
        template: `<SurplusAuctionTransactionTable error="Error while retrieving events. This is a demo error message, no real error occurred." />`,
    }));
