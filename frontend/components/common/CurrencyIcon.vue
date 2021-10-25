<template>
    <cryptoicon :symbol="icon" :size="size" :color="color" generic />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'CurrencyIcon',
    props: {
        currencySymbol: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            default: '25',
        },
    },
    computed: {
        icon(): string {
            if (this.currencySymbol.startsWith('UNI')) {
                return 'UNI';
            } else if (this.currencySymbol === 'RENBTC') {
                return 'BTC';
            }
            return this.currencySymbol;
        },
        color(): string {
            if (this?.$store?.getters['preferences/getIsDarkMode']) {
                return '#D1D5DB';
            }
            return '#111827';
        },
    },
});
</script>
