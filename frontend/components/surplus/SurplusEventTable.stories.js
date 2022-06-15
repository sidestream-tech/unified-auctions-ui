import { storiesOf } from '@storybook/vue';
import SurplusEventTable from '~/components/surplus/SurplusEventTable';
import { generateFakeSurplusEvents } from '~/helpers/generateFakeSurplusEvent';

const fakeSurplusEvents = generateFakeSurplusEvents();

const common = {
    components: { SurplusEventTable },
    data: () => ({
        events: fakeSurplusEvents,
        userWalletAddress: fakeSurplusEvents[1].walletAddress,
    }),
};

storiesOf('Surplus/SurplusEventTable', module)
    .add('Default', () => ({
        ...common,
        template: `<SurplusEventTable :events="events" :userWalletAddress="userWalletAddress" />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `<SurplusEventTable :isLoading="true" />`,
    }))
    .add('Error', () => ({
        ...common,
        template: `<SurplusEventTable error="Error while retrieving events. This is a demo error message, no real error occurred." />`,
    }));
