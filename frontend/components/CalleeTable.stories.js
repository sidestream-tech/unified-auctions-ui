import { storiesOf } from '@storybook/vue';
import CalleeTable from './CalleeTable';
import { getCalleesByChainId } from '~/../core/src/constants/CALLEES';

const common = {
    components: { CalleeTable },
};

storiesOf('CalleeTable', module)
    .add('Mainnet', () => ({
        ...common,
        computed: {
            callees() {
                return getCalleesByChainId('0x1');
            },
        },
        template: '<CalleeTable :callees="callees" />',
    }))
    .add('Kovan', () => ({
        ...common,
        computed: {
            callees() {
                return getCalleesByChainId('0x2a');
            },
        },
        template: '<CalleeTable :callees="callees" />',
    }))
    .add('Goerli', () => ({
        ...common,
        computed: {
            callees() {
                return getCalleesByChainId('0x5');
            },
        },
        template: '<CalleeTable :callees="callees" />',
    }))
    .add('No Callees for Network', () => ({
        ...common,
        template: '<CalleeTable />',
    }));
