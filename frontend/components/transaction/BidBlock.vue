<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Made a bid">
            Auction participation incurs transaction fees (paid in ETH). Hence the connected wallet needs to hold
            enough funds to cover these fees. Whenever a transaction that incurs such fees needs to be processed a
            confirmation from within the wallet is necessary and will be prompted.
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <BaseButton :disabled="disabled" :is-loading="isLoading" type="primary">
                <span
                    >Bid <format-currency :value="totalPrice" currency="DAI" /> for
                    <format-currency :value="collateralAmount" :currency="collateralSymbol"
                /></span>
            </BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';

export default Vue.extend({
    components: {
        TextBlock,
        BaseButton,
        FormatCurrency,
    },
    props: {
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        totalPrice: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        collateralAmount: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        collateralSymbol: {
            type: String,
            default: '',
        },
    },
});
</script>
