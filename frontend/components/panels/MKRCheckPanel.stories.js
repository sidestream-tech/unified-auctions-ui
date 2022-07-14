import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import MKRCheckPanel from '~/components/panels/MKRCheckPanel';

const common = {
    components: { MKRCheckPanel },
    data: () => ({
        walletMKR: new BigNumber(faker.finance.amount(50, 99)),
        requiredMKR: new BigNumber(faker.finance.amount(100, 200)),
        allowanceMKR: new BigNumber(faker.finance.amount(25, 49)),
        network: 'mainnet',
        tokenAddress: faker.finance.ethereumAddress(),
    }),
    methods: {
        refresh: action('refresh'),
        isCorrect: action('isCorrect'),
        setAllowanceAmount: action('setAllowanceAmount'),
    },
    template: `
    <MKRCheckPanel 
        v-bind="$data"
        @refresh="refresh"
        @setAllowanceAmount="setAllowanceAmount"
        @update:isCorrect="isCorrect"
    />
    `,
};

storiesOf('Panels/MKRCheckPanel', module)
    .add('Not enough MKR in wallet, Not enough allowance', () => ({
        ...common,
    }))
    .add('Enough MKR in wallet, Not enough allowance', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMKR: new BigNumber(faker.finance.amount(201, 300)),
        }),
    }))
    .add('Not enough MKR in wallet, Enough allowance', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            allowanceMKR: new BigNumber(faker.finance.amount(300, 400)),
        }),
    }))
    .add('Enough MKR, Enough allowance', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMKR: new BigNumber(faker.finance.amount(201, 300)),
            allowanceMKR: new BigNumber(faker.finance.amount(300, 400)),
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isDisabled: true,
        }),
    }))
    .add('Refreshing', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isRefreshing: true,
        }),
    }))
    .add('Loading', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isLoading: true,
        }),
    }))
    .add('No Wallet connected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletMKR: undefined,
            allowanceMKR: undefined,
        }),
    }));
