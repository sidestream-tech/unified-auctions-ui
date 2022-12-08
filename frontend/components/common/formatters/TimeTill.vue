<template>
    <span :title="date">
        <span v-if="timeTill" :class="{ 'font-bold': isEndingSoon }">{{ timeTill }}</span>
        <span v-else class="opacity-50">Unknown</span>
    </span>
</template>

<script lang="ts">
import Vue from 'vue';
import { formatInterval } from '~/helpers/tillDuration';

const ENDING_SOON_THRESHOLD = 1000 * 60 * 15;

export default Vue.extend({
    props: {
        date: {
            type: [String, Number, Date],
            default: '',
        },
    },
    data: () => ({
        timeTill: '',
        isEndingSoon: false,
    }),
    computed: {
        parsedDate(): Date | null {
            const date: Date = new Date(this.date);
            if (isNaN(date.getTime())) {
                return null;
            }
            return date;
        },
    },
    created() {
        this.calculateTime();
        setInterval(this.calculateTime, 1000);
    },
    methods: {
        calculateTime(): void {
            if (this.parsedDate) {
                const now = new Date();
                this.timeTill = formatInterval(now, this.parsedDate);
                const duration = this.parsedDate.getTime() - now.getTime();
                this.isEndingSoon = duration < ENDING_SOON_THRESHOLD && duration > 0;
            } else {
                this.timeTill = '';
            }
        },
    },
});
</script>
