<template>
    <BasePanel :current-state="currentStateAndTitle.name">
        <template #title>
            {{ currentStateAndTitle.title }}
            <time-till v-if="auction.state === 'have-bids'" :date="auction.earliestEndDate" />
        </template>
        <TextBlock v-if="auction.state === 'ready-for-collection'">
            Since the end of the auction at {{ auction.earliestEndDate.toUTCString() }}, the winner can now collect the
            auction amount.
        </TextBlock>
        <TextBlock v-else>
            If no one else bids on the auction, the winner be able to collect the auction amount when the auction is
            ended after {{ auction.earliestEndDate.toUTCString() }}
        </TextBlock>
        <div class="flex justify-end gap-5">
            <BaseButton
                class="w-full md:w-80"
                type="primary"
                :disabled="currentStateAndTitle.title !== 'Auctioned DAI is ready to be collected' || isCollecting"
                :is-loading="isCollecting"
                @click="$emit('collect')"
            >
                <span v-if="isCollecting">Collecting...</span>
                <span v-else>Collect <format-currency :value="auction.receiveAmountDAI" currency="DAI" /> </span>
            </BaseButton>
        </div>
    </BasePanel>
</template>

<script lang="ts">
import Vue from 'vue';
import { SurplusAuction } from 'auctions-core/src/types';
import BasePanel from '../common/BasePanel.vue';
import TextBlock from '../common/TextBlock.vue';
import FormatCurrency from '../utils/FormatCurrency.vue';
import BaseButton from '../common/BaseButton';
import TimeTill from '../common/TimeTill.vue';

export default Vue.extend({
    name: 'CollectSurplusAuctionPanel',
    components: { TimeTill, FormatCurrency, TextBlock, BasePanel, BaseButton },
    props: {
        auction: {
            type: Object as Vue.PropType<SurplusAuction>,
            default: undefined,
        },
        userWalletAddress: {
            type: String,
            default: null,
        },
        isCollecting: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        bidEvents() {
            if (!this.auction || !this.auction.events) {
                return null;
            }
            return this.auction.events.filter(event => {
                return event.type === 'bid';
            });
        },
        isCurrentWalletHighestBidder() {
            if (!this.userWalletAddress) {
                return false;
            }
            return this.userWalletAddress === this.bidEvents[this.bidEvents.length - 1].address;
        },
        currentStateAndTitle(): PanelProps {
            if (this.auction.state === 'just-started') {
                return {
                    name: 'inactive',
                    title: `Collecting DAI will not be possible until at least one bid`,
                };
            }
            if (this.auction.state === 'ready-for-collection') {
                if (this.isCurrentWalletHighestBidder) {
                    return {
                        name: 'notice',
                        title: `Auctioned DAI is ready to be collected`,
                    };
                }
                return {
                    name: 'inactive',
                    title: `Auctioned DAI is ready to be collected, but you're not the winner`,
                };
            }
            if (this.auction.state === 'collected') {
                return {
                    name: this.isCurrentWalletHighestBidder ? 'correct' : 'inactive',
                    title: `Auctioned DAI has been collected`,
                };
            }
            if (this.isCurrentWalletHighestBidder) {
                return {
                    name: 'notice',
                    title: `Collecting DAI will be possible in `,
                };
            }
            return {
                name: 'inactive',
                title: `Collecting DAI will be possible in `,
            };
        },
    },
});
</script>
