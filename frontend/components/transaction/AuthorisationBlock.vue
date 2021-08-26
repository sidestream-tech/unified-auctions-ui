<template>
    <div class="w-1/2">
        <TextBlock title="Authorize transaction">
            <div v-if="isAuthorized" class="text-gray-800">
                Different types of transactions have to be authorized once per type before participating in auction.
                The transaction type for <span class="uppercase">{{ currencyType }}</span> has already been authorized
                by you.
            </div>
            <div v-else class="text-gray-800">
                To participate in auctions you need to sign the approval transactions below and move DAI that will be
                used for bidding to the VAT.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button v-if="state === 'notAuthorized'" type="primary" @click="$emit('authorize')">
                Authorize
            </base-button>
            <base-button v-if="state === 'disabled'" type="primary" disabled> Authorize </base-button>
            <base-button v-if="state === 'authorizing'" type="primary" is-loading> Authorizing... </base-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';

export default Vue.extend({
    name: 'WalletBlock',
    components: {
        TextBlock,
        BaseButton,
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
        isAuthorized: {
            type: Boolean,
            default: false,
        },
        currencyType: {
            type: String,
            required: true,
        },
    },
    computed: {
        state(): string {
            if (this.isLoading) {
                return 'authorizing';
            }
            if (this.disabled) {
                return 'disabled';
            }
            if (this.isAuthorized) {
                return 'authorized';
            }
            return 'notAuthorized';
        },
    },
});
</script>
