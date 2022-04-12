import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BigNumber from 'bignumber.js';
import DepositBlock from './DepositBlock';

const transactionBidAmount = new BigNumber(faker.finance.amount());

const common = {
    components: { DepositBlock },
    data() {
        return {
            transactionBidAmount,
            walletVatDai: new BigNumber(faker.finance.amount(0, transactionBidAmount.toNumber())),
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
        :transactionBidAmount="transactionBidAmount"
    />`,
    }))
    .add('Disabled', () => ({
        ...common,
        template: `
    <DepositBlock 
        :walletDai="walletDai"
        :walletVatDai="walletVatDai"
        :transactionBidAmount="transactionBidAmount"
        disabled
    />`,
    }))
    .add('Disabled and missing walletDai and walletVatDai', () => ({
        ...common,
        template: `
        <DepositBlock
            :transactionBidAmount="transactionBidAmount"
            disabled
        />`,
    }))
    .add('Loading', () => ({
        ...common,
        template: `
        <DepositBlock 
            :walletDai="walletDai"
            :walletVatDai="walletVatDai"
            :transactionBidAmount="transactionBidAmount"
            is-loading
        />`,
    }))
    .add('Expert Mode', () => ({
        ...common,
        template: `
        <DepositBlock 
            :walletDai="walletDai"
            :walletVatDai="walletVatDai"
            :transactionBidAmount="transactionBidAmount"
            :is-explanations-shown="false"
        />`,
    }))
    .add('Missing walletDai and walletVatDai', () => ({
        ...common,
        template: `
        <DepositBlock 
            :transactionBidAmount="transactionBidAmount"
        />`,
    }))
    .add('Minimum to deposit is 0', () => ({
        components: { DepositBlock },
        data() {
            return {
                walletDai: new BigNumber(faker.finance.amount()),
                walletVatDai: new BigNumber(100),
                transactionBidAmount: new BigNumber(100),
            };
        },
        template: `
        <DepositBlock 
            :walletDai="walletDai"
            :walletVatDai="walletVatDai"
            :transactionBidAmount="transactionBidAmount"
        />`,
    }))
    .add('Not enough DAI in wallet', () => ({
        components: { DepositBlock },
        data() {
            return {
                walletDai: new BigNumber(faker.finance.amount(0, 50)),
                walletVatDai: new BigNumber(faker.finance.amount(0, 20)),
                transactionBidAmount: new BigNumber(faker.finance.amount(50, 100)),
            };
        },
        template: `
        <DepositBlock 
            :walletDai="walletDai"
            :walletVatDai="walletVatDai"
            :transactionBidAmount="transactionBidAmount"
        />`,
    }));
