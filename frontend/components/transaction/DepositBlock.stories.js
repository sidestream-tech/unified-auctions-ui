import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import DepositBlock from './DepositBlock';

const transactionAmountDai = new BigNumber(faker.finance.amount());

const common = {
    components: { DepositBlock },
    data() {
        return {
            transactionAmountDai,
            walletVatDai: new BigNumber(faker.finance.amount(0, transactionAmountDai.toNumber())),
            walletDai: new BigNumber(faker.finance.amount()),
        };
    },
};

storiesOf('Transaction/DepositBlock', module)
    .add('Default', () => ({
        ...common,
        template: `
    <DepositBlock 
        :walletDai="walletDai"
        :walletVatDai="walletVatDai"
        :transactionAmountDai="transactionAmountDai"
    />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
    <DepositBlock 
        :walletDai="walletDai"
        :walletVatDai="walletVatDai"
        :transactionAmountDai="transactionAmountDai"
        disabled
    />`,
    }))
    .add('Disabled and missing walletDai and walletVatDai', () => ({
        ...common,
        template: `
        <DepositBlock
            :transactionAmountDai="transactionAmountDai"
            disabled
        />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `
        <DepositBlock 
            :walletDai="walletDai"
            :walletVatDai="walletVatDai"
            :transactionAmountDai="transactionAmountDai"
            is-loading
        />`,
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: `
        <DepositBlock 
            :walletDai="walletDai"
            :walletVatDai="walletVatDai"
            :transactionAmountDai="transactionAmountDai"
            :is-explanations-shown="false"
        />`,
    }))
    .add('Missing walletDai and walletVatDai', () => ({
        ...common,
        template: `
        <DepositBlock 
            :transactionAmountDai="transactionAmountDai"
        />`,
    }))
    .add('Minimum to deposit is 0', () => ({
        components: { DepositBlock },
        data() {
            return {
                walletDai: new BigNumber(faker.finance.amount()),
                walletVatDai: new BigNumber(100),
                transactionAmountDai: new BigNumber(100),
            };
        },
        template: `
        <DepositBlock 
            :walletDai="walletDai"
            :walletVatDai="walletVatDai"
            :transactionAmountDai="transactionAmountDai"
        />`,
    }))
    .add('Not enough DAI in wallet', () => ({
        components: { DepositBlock },
        data() {
            return {
                walletDai: new BigNumber(faker.finance.amount(0, 50)),
                walletVatDai: new BigNumber(faker.finance.amount(0, 20)),
                transactionAmountDai: new BigNumber(faker.finance.amount(50, 100)),
            };
        },
        template: `
        <DepositBlock 
            :walletDai="walletDai"
            :walletVatDai="walletVatDai"
            :transactionAmountDai="transactionAmountDai"
        />`,
    }));
