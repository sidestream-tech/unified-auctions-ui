import { storiesOf } from '@storybook/vue';
import ElectronUpdateBanner from './ElectronUpdateBanner';

const common = {
    components: { ElectronUpdateBanner },
    template: `<ElectronUpdateBanner v-bind="$data" />`,
};

storiesOf('Layout/ElectronUpdateBanner', module)
    .add('Available', () => ({
        ...common,
        data: () => ({
            version: '0.0.1',
            status: 'available',
            url: `https://github.com/sidestream-tech/unified-auctions-ui/releases/latest`,
        }),
    }))
    .add('Unavailable', () => ({
        ...common,
        data: () => ({
            version: '0.0.1',
            status: 'unavailable',
            url: `https://github.com/sidestream-tech/unified-auctions-ui/releases/`,
        }),
    }))
    .add('Error', () => ({
        ...common,
        data: () => ({
            version: '0.0.1',
            status: 'error',
            url: `https://github.com/sidestream-tech/unified-auctions-ui/releases/`,
            errorMessage: 'Test',
        }),
    }));
