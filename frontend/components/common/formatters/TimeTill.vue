<template>
    <span :title="parsedDate">
        <span v-if="timeTill" :class="{ 'font-bold': isEndingSoon }">{{ timeTill }}</span>
        <span v-else-if="date">{{ date }}</span>
        <span v-else></span>
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
        isCountUp: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        timeTill: '',
        isEndingSoon: false,
        secondsElapsed: 0,
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
    watch: {
        parsedDate() {
            this.secondsElapsed = 0;
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
                if (this.isCountUp) {
                    ++this.secondsElapsed;
                    const newDate = new Date(now.getTime() + this.secondsElapsed * 1000);
                    this.timeTill = formatInterval(now, newDate);
                } else {
                    this.timeTill = formatInterval(now, this.parsedDate);
                    const duration = this.parsedDate.getTime() - now.getTime();
                    this.isEndingSoon = duration < ENDING_SOON_THRESHOLD && duration > 0;
                }
            } else {
                this.timeTill = '';
            }
        },
    },
});
</script>
