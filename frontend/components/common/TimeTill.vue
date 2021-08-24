<template>
    <span :title="parsedDate">
        <span v-if="timeTill">{{ timeTill }}</span>
        <span v-else-if="date">{{ date }}</span>
        <span v-else></span>
    </span>
</template>

<script lang="ts">
import Vue from 'vue';
import { formatInterval } from '~/helpers/tillDuration';

export default Vue.extend({
    props: {
        date: {
            type: [String, Number, Date],
            default: '',
        },
    },
    data: () => ({
        timeTill: '',
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
                this.timeTill = formatInterval(new Date(), this.parsedDate);
            } else {
                this.timeTill = '';
            }
        },
    },
});
</script>
