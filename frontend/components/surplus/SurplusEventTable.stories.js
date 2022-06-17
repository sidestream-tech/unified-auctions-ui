import { storiesOf } from '@storybook/vue';
import SurplusEventTable from '~/components/surplus/SurplusEventTable';
import { generateFakeSurplusEvent, generateFakeSurplusBidEvents } from '~/helpers/generateFakeSurplusEvent';

const fakeSurplusEvents = [
    generateFakeSurplusEvent('start'),
    ...generateFakeSurplusBidEvents(),
    generateFakeSurplusEvent('collect'),
];

const common = {
    components: { SurplusEventTable },
    data: () => ({
        events: fakeSurplusEvents,
        userWalletAddress: fakeSurplusEvents[1].address,
    }),
};

storiesOf('Surplus/SurplusEventTable', module)
    .add('Default', () => ({
        ...common,
        template: `<SurplusEventTable :events="events" :userWalletAddress="userWalletAddress" />`,
    }))
    .add('No Data', () => ({
        ...common,
        template: `<SurplusEventTable />`,
    }))
    .add('Empty Array', () => ({
        ...common,
        template: `<SurplusEventTable :events="[]" />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `<SurplusEventTable :isLoading="true" />`,
    }))
    .add('Error', () => ({
        ...common,
        template: `<SurplusEventTable error="Error while retrieving events. This is a demo error message, no real error occurred." />`,
    }));
