import Vue from 'vue';
import { action } from '@storybook/addon-actions';
import 'ant-design-vue/dist/antd.css';
import '../assets/css/tailwind.css';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
};

// Registering 'nuxt-link'
Vue.component('NuxtLink', {
    props: {
        to: {
            type: String,
            required: true,
        },
    },
    methods: {
        log() {
            action('link target')(this.to);
        },
    },
    template: '<a href="#" @click.prevent="log()"><slot>NuxtLink</slot></a>',
});
