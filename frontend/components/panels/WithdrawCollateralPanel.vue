<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            After participating in the auction, the collateral will end up in your VAT account. One more transaction is
            required to move it to your wallet. Current amount of collateral in the VAT:
            <FormatCurrency :value="collateralVatBalance" :currency="collateralSymbol" />
        </TextBlock>
        <div class="flex justify-end mt-2 gap-5">
            <BaseButton
                :disabled="isWithdrawing"
                :is-loading="isFetching"
                @click="$emit('fetchCollateralVatBalance', collateralType)"
            >
                Refresh {{ collateralSymbol }} balance in VAT
            </BaseButton>
            <BaseButton
                type="primary"
                :disabled="disabled || !hasCollateralToWithdraw || isFetching"
                :is-loading="isWithdrawing"
                @click="$emit('withdrawAllCollateralFromVat', collateralType)"
            >
                <span v-if="hasCollateralToWithdraw">
                    Withdraw <FormatCurrency :value="collateralVatBalance" :currency="collateralSymbol" /> from VAT
                </span>
                <span v-else> Nothing to withdraw yet </span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import { getCollateralConfigByType } from 'auctions-core/src/constants/COLLATERALS';
import BigNumber from 'bignumber.js';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
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
        disabled: {
            type: Boolean,
            default: false,
        },
        isExplanationsShown: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        currentStateAndTitle(): PanelProps {
            if (!this.hasCollateralToWithdraw) {
                return {
                    name: 'inactive',
                    title: `No ${this.collateralSymbol} to withdraw yet`,
                };
            }
            return {
                name: 'notice',
                title: `Withdraw ${this.collateralSymbol} from VAT`,
            };
        },
        collateralSymbol(): string {
            try {
                const collateral = getCollateralConfigByType(this.collateralType);
                return collateral.tokenName;
            } catch {
                return '';
            }
        },
        hasCollateralToWithdraw(): boolean {
            return this.collateralVatBalance?.isGreaterThan(0) ?? false;
        },
    },
});
</script>
