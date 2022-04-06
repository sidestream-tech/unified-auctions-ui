import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import AuctionRestartPanel from '~/components/panels/AuctionRestartPanel';

const common = {
    components: { AuctionRestartPanel },
    data() {
        return {
            auctionIsActive: false,
            transactionFee: new BigNumber(faker.finance.amount(0, 10)),
            walletAddress: faker.finance.ethereumAddress(),
            isRestarting: false,
            disabled: false,
            isExplanationsShown: true,
        };
    },
    methods: {
        restart() {
            this.isRestarting = true;
            setTimeout(() => {
                this.isRestarting = false;
            }, 1000);
        },
        isCorrect: action('isCorrect'),
    },
    template: `
        <AuctionRestartPanel
            v-bind="$data"
            @restart="restart"
            @update:isCorrect="isCorrect"
        />`,
};

storiesOf('Panels/AuctionRestartPanel', module)
    .add('Inactive Auction', () => ({
        ...common,
    }))
    .add('Active Auction', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            auctionIsActive: true,
        }),
    }))
    .add('Expert Mode', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isExplanationsShown: false,
        }),
    }))
    .add('Disabled', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            disabled: true,
        }),
    }))
    .add('No Wallet Connected', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            walletAddress: undefined,
            disabled: true,
        }),
    }))
    .add('Restarting', () => ({
        ...common,
        data: () => ({
            ...common.data(),
            isRestarting: true,
        }),
    }));
