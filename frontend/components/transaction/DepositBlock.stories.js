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
            walletVatDAI: new BigNumber(faker.finance.amount(0, transactionAmountDAI.toNumber())),
            walletDAI: new BigNumber(faker.finance.amount()),
        };
    },
};

storiesOf('Transaction/DepositBlock', module)
    .add('Default', () => ({
        ...common,
        template: `
    <DepositBlock 
        :walletDAI="walletDAI"
        :walletVatDAI="walletVatDAI"
        :transactionAmountDAI="transactionAmountDAI"
    />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
    <DepositBlock 
        :walletDAI="walletDAI"
        :walletVatDAI="walletVatDAI"
        :transactionAmountDAI="transactionAmountDAI"
        disabled
    />`,
    }))
    .add('Disabled and missing walletDAI and walletVatDAI', () => ({
        ...common,
        template: `
        <DepositBlock
            :transactionAmountDAI="transactionAmountDAI"
            disabled
        />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `
        <DepositBlock 
            :walletDAI="walletDAI"
            :walletVatDAI="walletVatDAI"
            :transactionAmountDAI="transactionAmountDAI"
            is-loading
        />`,
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: `
        <DepositBlock 
            :walletDAI="walletDAI"
            :walletVatDAI="walletVatDAI"
            :transactionAmountDAI="transactionAmountDAI"
            :is-explanations-shown="false"
        />`,
    }))
    .add('Missing walletDAI and walletVatDAI', () => ({
        ...common,
        template: `
        <DepositBlock 
            :transactionAmountDAI="transactionAmountDAI"
        />`,
    }))
    .add('Minimum to deposit is 0', () => ({
        components: { DepositBlock },
        data() {
            return {
                walletDAI: new BigNumber(faker.finance.amount()),
                walletVatDAI: new BigNumber(100),
                transactionAmountDAI: new BigNumber(100),
            };
        },
        template: `
        <DepositBlock 
            :walletDAI="walletDAI"
            :walletVatDAI="walletVatDAI"
            :transactionAmountDAI="transactionAmountDAI"
        />`,
    }));
