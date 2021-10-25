import { storiesOf } from '@storybook/vue';
import faker from 'faker';
import CurrencyIcon from '~/components/common/CurrencyIcon';
import { getAllCollateralSymbols } from '~/lib/constants/COLLATERALS';

const common = {
    components: { CurrencyIcon },
    data: () => ({
        currencySymbol: faker.helpers.randomize(getAllCollateralSymbols()),
    }),
};

storiesOf('Common/CurrencyIcon', module)
    .add('Default', () => ({
        ...common,
        template: '<CurrencyIcon :currency-symbol="currencySymbol" />',
    }))
    .add('All icons', () => ({
        components: { CurrencyIcon },
        data: () => ({
            symbols: getAllCollateralSymbols(),
        }),
        template: `<div class="flex flex-col space-y-2">
                <div :key="symbol" v-for="symbol in symbols" class="flex items-center">
                    <CurrencyIcon :currency-symbol="symbol" />
                    <p class="ml-2">{{symbol}}</p>
                </div>
            </div>`,
    }))
    .add('Placeholder Icon', () => ({
        ...common,
        template: '<CurrencyIcon currency-symbol="TEST" />',
    }))
    .add('Bigger', () => ({
        ...common,
        template: '<CurrencyIcon :currency-symbol="currencySymbol" size="150" />',
    }));
