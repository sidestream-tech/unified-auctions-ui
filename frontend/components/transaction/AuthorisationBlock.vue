<template>
    <div>
        <TextBlock v-if="isExplanationsShown" :title="!isWalletAuthorised ? 'Authorize your participation' : ''">
            <div v-if="!isWalletAuthorised">
                Auction participation requires preliminary authorization steps that incur transaction fees. These are a
                prerequisite for every new user to participate in an auction. The first authorization is required to
                allow the Maker Protocol to deposit DAI to your wallet. This operation should be done only once for all
                auctions and can be done in advance. Approximate fee: 0.000123
                <format-currency :currency="collateralType" />.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse my-3">
            <base-button
                v-if="walletAuthorizationState === 'notAuthorized'"
                type="primary"
                class="w-full md:w-80"
                @click="$emit('authorizeWallet')"
            >
                Authorize DAI Transactions
            </base-button>
            <base-button v-if="walletAuthorizationState === 'disabled'" type="primary" class="w-full md:w-80" disabled>
                Authorize DAI Transactions
            </base-button>
            <base-button
                v-if="walletAuthorizationState === 'authorizing'"
                type="primary"
                class="w-full md:w-80"
                is-loading
            >
                Authorizing...
            </base-button>
        </div>
        <TextBlock v-if="isExplanationsShown" :title="isWalletAuthorised ? 'Authorize your participation' : ''">
            <div v-if="isCollateralAuthorised">
                Different types of transactions have to be authorized once per type before participating in auction.
                The transaction type for <format-currency :currency="collateralType" /> has already been authorized by
                you.
            </div>
            <div v-else>
                The second authorization is required to allow an automated mechanism to sell the auctioned
                <format-currency :currency="collateralType" /> on a different marketplace. This operation is done only
                once per auction type and can be done in advance. Approximate fee: 0.000123
                <format-currency :currency="collateralType" />.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button
                v-if="collateralAuthorizationState === 'notAuthorized'"
                type="primary"
                class="w-full md:w-80"
                @click="$emit('authorizeCollateral')"
            >
                Authorize <format-currency class="px-1" :currency="collateralType" /> Transactions
            </base-button>
            <base-button
                v-else-if="collateralAuthorizationState === 'disabled'"
                type="primary"
                class="w-full md:w-80"
                disabled
            >
                Authorize <format-currency class="px-1" :currency="collateralType" /> Transactions
            </base-button>
            <base-button
                v-else-if="collateralAuthorizationState === 'authorizing'"
                type="primary"
                class="w-full md:w-80"
                is-loading
            >
                Authorizing...
            </base-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    name: 'WalletBlock',
    components: {
        TextBlock,
        BaseButton,
        FormatCurrency,
    },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        isWalletAuthorised: {
            type: Boolean,
            default: false,
        },
        isCollateralAuthorised: {
            type: Boolean,
            default: false,
        },
        collateralType: {
            type: String,
            required: true,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        walletAuthorizationState(): string {
            if (this.isWalletAuthorised) {
                return 'authorized';
            }
            if (this.isLoading) {
                return 'authorizing';
            }
            if (this.disabled) {
                return 'disabled';
            }
            return 'notAuthorized';
        },
        collateralAuthorizationState(): string {
            if (!this.isWalletAuthorised) {
                return 'disabled';
            }
            if (this.isCollateralAuthorised) {
                return 'authorized';
            }
            if (this.isLoading) {
                return 'authorizing';
            }
            if (this.disabled) {
                return 'disabled';
            }
            return 'notAuthorized';
        },
    },
});
</script>
