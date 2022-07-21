<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>{{ currentStateAndTitle.title }}</template>
        <TextBlock v-if="isExplanationsShown">
            In order to participate, you need to authorize a certain
            <Explain text="smart contract">
                The particular smart contract is called Clipper and its technical specification can be found
                <a href="https://github.com/makerdao/dss/blob/master/src/clip.sol#L51-L473" target="_blank"> here </a>
            </Explain>
            to alter your internal DAI balance. This is only done once per collateral type and can be done in advance.
            Approximate fee:
            <format-currency :value="authTransactionFeeETH" currency="eth" />
        </TextBlock>
        <div class="flex justify-end mt-2">
            <BaseButton
                class="w-full md:w-80"
                type="primary"
                :is-loading="isLoading"
                :disabled="disabled || isCollateralAuthorized || !walletAddress"
                @click="$emit('authorizeCollateral')"
            >
                <span v-if="isLoading">Authorizing...</span>
                <span v-else-if="!isCollateralAuthorized">Authorize {{ collateralType }} Transactions</span>
                <span v-else>Already authorized</span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import BigNumber from 'bignumber.js';
import BaseButton from '~/components/common/inputs/BaseButton.vue';
import BasePanel from '~/components/common/other/BasePanel.vue';
import TextBlock from '~/components/common/other/TextBlock.vue';
import Explain from '~/components/common/other/Explain.vue';
import FormatCurrency from '~/components/common/formatters/FormatCurrency.vue';

export default Vue.extend({
    components: {
        BaseButton,
        BasePanel,
        TextBlock,
        Explain,
        FormatCurrency,
    },
    props: {
        collateralType: {
            type: String,
            required: true,
        },
        authorizedCollaterals: {
            type: Array as Vue.PropType<string[]>,
            default: () => [],
        },
        authTransactionFeeETH: {
            type: Object as Vue.PropType<BigNumber>,
            default: null,
        },
        walletAddress: {
            type: String,
            default: null,
        },
        isLoading: {
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
            if (!this.walletAddress) {
                return {
                    name: 'inactive',
                    title: `The ${this.collateralType} authorization is unknown until a wallet is connected`,
                };
            }
            if (!this.isCollateralAuthorized) {
                if (this.disabled) {
                    return {
                        name: 'inactive',
                        title: `The wallet is not yet authorized to execute ${this.collateralType} transactions`,
                    };
                }
                return {
                    name: 'incorrect',
                    title: `The wallet is not yet authorized to execute ${this.collateralType} transactions`,
                };
            }
            return {
                name: 'correct',
                title: `The wallet is authorized to execute ${this.collateralType} transactions`,
            };
        },
        isCollateralAuthorized(): boolean {
            return this.authorizedCollaterals.includes(this.collateralType);
        },
    },
    watch: {
        currentStateAndTitle: {
            immediate: true,
            handler(newCurrentStateAndTitle) {
                this.$emit('update:isCorrect', newCurrentStateAndTitle.name === 'correct');
            },
        },
    },
});
</script>
