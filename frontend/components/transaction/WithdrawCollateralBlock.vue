<template>
    <div v-if="!!collateralSymbol" class="WithdrawCollateralBlock">
        <TextBlock v-if="isExplanationsShown" :title="blockTitle">
            After participating in the auction, the collateral will end up in your VAT account. One more transaction is
            required to move it to your wallet.
        </TextBlock>
        <div class="flex flex-row gap-5 mt-3">
            <BaseButton
                class="w-full md:w-80"
                :is-loading="isFetching"
                :disabled="isWithdrawing"
                @click="$emit('fetchCollateralVatBalance', collateralType)"
            >
                Refresh {{ collateralSymbol }} balance in VAT
            </BaseButton>
            <BaseButton
                class="w-full md:w-80"
                type="primary"
                :disabled="disabled || !hasCollateralToWithdraw || isFetching"
                :is-loading="isWithdrawing"
                @click="$emit('withdrawAllCollateralFromVat', collateralType)"
            >
                <span v-if="hasCollateralToWithdraw">
                    Withdraw <FormatCurrency :value="collateralVatBalance" :currency="collateralSymbol" />
                </span>
                <span v-else> Nothing to withdraw yet </span>
            </BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import { getCollateralConfigByType } from '~/../core/src/constants/COLLATERALS';

export default Vue.extend({
    components: {
        TextBlock,
        BaseButton,
        FormatCurrency,
    },
    props: {
        collateralType: {
            type: String,
            required: true,
        },
        collateralVatBalance: {
            type: Object as Vue.PropType<BigNumber>,
            default: undefined,
        },
        isWithdrawing: {
            type: Boolean,
            default: false,
        },
        isFetching: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        collateralSymbol(): string {
            try {
                const collateral = getCollateralConfigByType(this.collateralType);
                return collateral.symbol;
            } catch {
                return '';
            }
        },
        blockTitle(): string {
            return `Withdraw ${this.collateralSymbol} from the VAT`;
        },
        hasCollateralToWithdraw(): boolean {
            return this.collateralVatBalance?.isGreaterThan(0) ?? false;
        },
    },
});
</script>
