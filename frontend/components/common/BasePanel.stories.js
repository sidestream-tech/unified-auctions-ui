import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import BasePanel from '~/components/common/BasePanel';

const common = {
    components: { BasePanel },
    data: () => ({
        inactive: faker.lorem.sentence(4),
        incorrect: faker.lorem.sentence(20),
        complete: faker.lorem.sentence(20),
        notice: faker.lorem.sentence(20),
        walletAdress: faker.finance.bitcoinAddress(),
    }),
    methods: {},
};

storiesOf('Common/BasePanel', module)
    .add('Default', () => ({
        ...common,
        template: '<BasePanel v-bind="$data" state="default"> This is a Default BasePanel </BasePanel>',
    }))
    .add('Inactive', () => ({
        ...common,
        template: '<BasePanel v-bind="$data" state="inactive"> (ICON) No wallet connected </BasePanel>',
    }))
    .add('Incorrect', () => ({
        ...common,
        template: '<BasePanel v-bind="$data" state="incorrect"> The amount is not present in the VAT </BasePanel>',
    }))
    .add('Complete', () => ({
        ...common,
        template: '<BasePanel v-bind="$data" state="complete"> (ICON) The amount is present in the VAT </BasePanel>',
    }))
    .add('Notice', () => ({
        ...common,
        template:
            '<BasePanel v-bind="$data" state="notice"> (ICON) The transaction net profit is negative for wallet with address: {{ walletAdress }}</BasePanel>',
    }));
