import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import DepositBlock from './DepositBlock';

const transactionAmountDAI = new BigNumber(faker.finance.amount());

const common = {
    components: { DepositBlock },
    data() {
        return {
            transactionAmountDAI,
            vatDAI: new BigNumber(faker.finance.amount(0, transactionAmountDAI.toNumber())),
            walletDAI: new BigNumber(faker.finance.amount()),
        };
    },
};

storiesOf('Transaction/DepositBlock', module).add('Default', () => ({
    ...common,
    template: `
    <DepositBlock 
        :walletDAI="walletDAI"
        :vatDAI="vatDAI"
        :transactionAmountDAI="transactionAmountDAI"
    />
    `,
}));
