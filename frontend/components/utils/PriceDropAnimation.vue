<template>
    <div>
        <p>
            Time to next price drop:
            <span v-if="timerCount !== undefined || Number.isNaN(timerCount)" class="font-semibold"
                >{{ timerCount.toFixed() }}s</span
            >
            <span v-else class="font-semibold"> N/A </span>
        </p>
        <Progress class="progress-bar" size="small" :show-info="false" :percent="percent" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Progress } from 'ant-design-vue';

export default Vue.extend({
    name: 'PriceDropAnimation',
    components: { Progress },
    props: {
        auctionStartDate: {
            type: [Date, String],
            required: true,
        },
        dropDuration: {
            type: Number,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            timerCount: 0 as number | undefined,
        };
    },
    computed: {
        percent(): number {
            if (this.timerCount) {
                return 100 - (this.timerCount / this.dropDuration) * 100;
            }
            return 0;
        },
    },
    mounted() {
        this.calculateTimerCount();
        setInterval(this.calculateTimerCount, 1000);
    },
    methods: {
        calculateTimerCount(): void {
            if (this.isValidTimeStamp()) {
                const auctionStartTimestamp = new Date(this.auctionStartDate).getTime();
                const now = new Date().getTime();
                const elapsedTime = (now - auctionStartTimestamp) / 1000;
                const timerCount = this.dropDuration - (elapsedTime % this.dropDuration);
                this.timerCount = timerCount;

                if (timerCount > this.dropDuration - 1) {
                    this.fetchAuctions();
                }
            } else {
                this.timerCount = undefined;
            }
        },
        isValidTimeStamp(): boolean {
            const auctionStartTimestamp = new Date(this.auctionStartDate).getTime();
            const now = new Date().getTime();
            if (isNaN(auctionStartTimestamp)) {
                return false;
            }
            if (this.disabled) {
                return false;
            }
            return now >= auctionStartTimestamp;
        },
        fetchAuctions(): void {
            // TODO: remove this call as soon as we properly implement price drop
            if (this.$store) {
                this.$store.dispatch('auctions/fetchWithoutLoading');
            }
        },
    },
});
</script>

<style scoped>
.progress-bar >>> .ant-progress-bg {
    transition: all 1s linear 0s !important;
}
</style>
