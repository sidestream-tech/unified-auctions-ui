import { storiesOf } from '@storybook/vue';
import CalleeTable from './CalleeTable';
import { getCalleesByNetworkType } from '~/../core/src/constants/CALLEES';

const common = {
    components: { CalleeTable },
};

storiesOf('CalleeTable', module)
    .add('Mainnet', () => ({
        ...common,
        computed: {
            callees() {
                return getCalleesByNetworkType('mainnet');
            },
        },
        template: '<CalleeTable :callees="callees" />',
    }))
    .add('Kovan', () => ({
        ...common,
        computed: {
            callees() {
                return getCalleesByNetworkType('kovan');
            },
        },
        template: '<CalleeTable :callees="callees" />',
    }))
    .add('Goerli', () => ({
        ...common,
        computed: {
            callees() {
                return getCalleesByNetworkType('goerli');
            },
        },
        template: '<CalleeTable :callees="callees" />',
    }))
    .add('No Callees for Network', () => ({
        ...common,
        template: '<CalleeTable />',
    }));
