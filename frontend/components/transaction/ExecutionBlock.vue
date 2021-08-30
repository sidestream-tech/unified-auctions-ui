<template>
    <div>
        <TextBlock title="Make a bid">
            <div v-if="state === 'executed'" class="text-gray-800">
                Transaction <format-address :value="transactionAddress" /> was successfully executed.
                <a :href="transactionURL" target="_blank" class="text-green-500">View on Etherscan</a>.
            </div>
            <div v-else class="text-gray-800">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrudexercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button v-if="state === 'notExecuted'" type="primary" class="w-56" @click="$emit('execute')">
                Execute
            </base-button>
            <base-button v-if="state === 'disabled'" type="primary" class="w-56" disabled> Execute </base-button>
            <base-button v-if="state === 'loading'" type="primary" class="w-56" is-loading> Executing... </base-button>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatAddress from '~/components/utils/FormatAddress.vue';

export default Vue.extend({
    name: 'WalletBlock',
    components: {
        FormatAddress,
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
        transactionAddress: {
            type: String,
            default: null,
        },
    },
    computed: {
        state(): string {
            if (this.isLoading) {
                return 'loading';
            }
            if (this.disabled) {
                return 'disabled';
            }
            if (!this.transactionAddress) {
                return 'notExecuted';
            }
            return 'executed';
        },
        transactionURL(): string {
            return `https://kovan.etherscan.io/address/${this.transactionAddress}`;
        },
    },
});
</script>
