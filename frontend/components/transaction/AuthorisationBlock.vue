<template>
    <div>
        <TextBlock title="Authorize transaction" class="TextBlock">
            <div v-if="isAuthorized" class="text-gray-800">
                Different types of transactions have to be authorized once per type before participating in auction.
                The transaction type for <span class="uppercase">{{ collateralType }}</span> has already been
                authorized by you.
            </div>
            <div v-else class="text-gray-800">
                Auction participation requires a preliminary one-time per user authorization that incurs transaction
                fees. It is essential for every new user that wants to interact with the auction process because an
                automated mechanism changes the balance of the user's wallet.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button v-if="state === 'notAuthorized'" type="primary" class="w-56" @click="$emit('authorize')">
                Authorize
            </base-button>
            <base-button v-if="state === 'disabled'" type="primary" class="w-56" disabled> Authorize </base-button>
            <base-button v-if="state === 'authorizing'" type="primary" class="w-56" is-loading>
                Authorizing...
            </base-button>
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
        collateralType: {
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
