<template>
    <div>
        <TextBlock v-if="isExplanationsShown" title="Authorize your participation">
            <div>
                Auction participation requires preliminary authorization steps that incur transaction fees. These are a
                prerequisite for every new user to participate in an auction. The first step authorizes a certain
                <Explain text="smart contract">
                    The particular smart contract is called DaiJoin and its technical specification can be found
                    <a href="https://github.com/makerdao/dss/blob/master/src/join.sol#L106-L142" target="_blank">
                        here
                    </a>
                </Explain>
                to alter your internal DAI
                <Explain text="balance">
                    The core vault engine of the Maker Protocol is called VAT and manages the central accounting
                    invariants of DAI. More information on the VAT can be found
                    <a
                        href="https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation#2-contract-details"
                        target="_blank"
                    >
                        here
                    </a></Explain
                >. This operation should be done only once for all auctions and can be done in advance. Approximate
                fee:
                <FormatCurrency :value="auctionTransaction.biddingTransactionFeeETH" :decimals="6" currency="eth" />.
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
            <base-button
                v-else-if="walletAuthorizationState === 'disabled'"
                type="primary"
                class="w-full md:w-80"
                disabled
            >
                Authorize DAI Transactions
            </base-button>
            <base-button
                v-else-if="walletAuthorizationState === 'authorizing'"
                type="primary"
                class="w-full md:w-80"
                is-loading
            >
                Authorizing...
            </base-button>
            <Tooltip v-else title="Already authorized for this wallet" placement="top">
                <div class="w-full md:w-80">
                    <base-button type="primary" class="w-full" disabled> Authorize DAI Transactions </base-button>
                </div>
            </Tooltip>
        </div>
        <TextBlock v-if="isExplanationsShown">
            <div>
                The second step authorizes another
                <Explain text="smart contract">
                    The particular smart contract is called Clipper and its technical specification can be found
                    <a href="https://github.com/makerdao/dss/blob/master/src/clip.sol#L51-L473" target="_blank">
                        here
                    </a>
                </Explain>
                to alter your internal DAI balance and is needed to bid on the auction. This operation is done only
                once per auction type and can be done in advance. Approximate fee:
                <FormatCurrency :value="auctionTransaction.authTransactionFeeETH" :decimals="6" currency="eth" />. The
                second authorization is required to allow an automated mechanism to sell the auctioned
            </div>
        </TextBlock>
        <div class="flex flex-row-reverse mt-3">
            <base-button
                v-if="collateralAuthorizationState === 'notAuthorized'"
                type="primary"
                class="w-full md:w-80"
                @click="$emit('authorizeCollateral')"
            >
                Authorize <format-currency class="px-1" :currency="auctionTransaction.collateralType" /> Transactions
            </base-button>
            <base-button
                v-else-if="collateralAuthorizationState === 'disabled'"
                type="primary"
                class="w-full md:w-80"
                disabled
            >
                Authorize <format-currency class="px-1" :currency="auctionTransaction.collateralType" /> Transactions
            </base-button>
            <base-button
                v-else-if="collateralAuthorizationState === 'authorizing'"
                type="primary"
                class="w-full md:w-80"
                is-loading
            >
                Authorizing...
            </base-button>

            <Tooltip v-else title="Already authorized for this wallet" placement="top">
                <div class="w-full md:w-80">
                    <base-button type="primary" class="w-full" disabled>
                        Authorize
                        <format-currency class="px-1" :currency="auctionTransaction.collateralType" /> Transactions
                    </base-button>
                </div>
            </Tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Tooltip } from 'ant-design-vue';
import TextBlock from '~/components/common/TextBlock.vue';
import BaseButton from '~/components/common/BaseButton.vue';
import FormatCurrency from '~/components/utils/FormatCurrency.vue';
import Explain from '~/components/utils/Explain.vue';

export default Vue.extend({
    name: 'WalletBlock',
    components: {
        Explain,
        TextBlock,
        BaseButton,
        FormatCurrency,
        Tooltip,
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
        auctionTransaction: {
            type: Object as Vue.PropType<AuctionTransaction>,
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
