import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import AuthorisationBlock from '~/components/transaction/AuthorisationBlock';
import { generateFakeAuctionTransaction } from '~/helpers/generateFakeAuction';

const fakeAuctionTransaction = generateFakeAuctionTransaction();

const common = {
    components: { AuthorisationBlock },
    data() {
        return {
            isLoading: false,
            isWalletAuthorised: false,
            isCollateralAuthorised: false,
            auctionTransaction: fakeAuctionTransaction,
            currencyType: faker.finance.currencyCode(),
        };
    },
    methods: {
        authorizeWallet() {
            this.isLoading = true;
            setTimeout(() => {
                this.isWalletAuthorised = true;
                this.isLoading = false;
            }, 1000);
        },
        authorizeCollateral() {
            this.isLoading = true;
            setTimeout(() => {
                this.isCollateralAuthorised = true;
                this.isLoading = false;
            }, 1000);
        },
    },
};

storiesOf('Transaction/AuthorisationBlock', module)
    .add('Default', () => ({
        ...common,
        template:
            '<AuthorisationBlock :auction-transaction="auctionTransaction" :isLoading="isLoading" :isWalletAuthorised="isWalletAuthorised" :isCollateralAuthorised="isCollateralAuthorised"  @authorizeWallet="authorizeWallet" @authorizeCollateral="authorizeCollateral" />',
    }))
    .add('Disabled', () => ({
        ...common,
        template: '<AuthorisationBlock :auction-transaction="auctionTransaction" :disabled="true" />',
    }))
    .add('Not Authorized', () => ({
        ...common,
        template: '<AuthorisationBlock :auction-transaction="auctionTransaction" />',
    }))
    .add('Authorizing', () => ({
        ...common,
        template: '<AuthorisationBlock :isLoading="true" :auction-transaction="auctionTransaction" />',
    }))
    .add('Authorized', () => ({
        ...common,
        template:
            '<AuthorisationBlock :isWalletAuthorised="true" :isCollateralAuthorised="true" :auction-transaction="auctionTransaction"/>',
    }));
