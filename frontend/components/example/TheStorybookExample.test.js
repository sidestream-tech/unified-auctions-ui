import Vue from 'vue';
import { mount } from '@vue/test-utils';
import TheStorybookExample from './TheStorybookExample';

Vue.component('NuxtLink', {
    props: {
        to: {
            type: String,
            required: true,
        },
    },
    template: '<a href="#"><slot>NuxtLink</slot></a>',
});

describe('TheStorybookExample', () => {
    test('displays message', () => {
        const wrapper = mount(TheStorybookExample);
        expect(wrapper.text()).toContain('Example input');
    });
});
