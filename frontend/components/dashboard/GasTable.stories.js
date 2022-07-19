import { storiesOf } from '@storybook/vue';
import { BigNumber } from 'bignumber.js';
import faker from 'faker';
import GasTable from './GasTable';
import { generateFakeGasParameters, generateFakeTransactionFees } from '~/helpers/generateFakeGas';

const common = {
    components: { GasTable },
    data: () => ({
        baseFeePerGas: new BigNumber(faker.datatype.number()),
        gasParameters: generateFakeGasParameters(),
        transactionFees: generateFakeTransactionFees(),
    }),
};

storiesOf('Dashboard/GasTable', module).add('Default', () => ({
    ...common,
    template:
        '<GasTable :baseFeePerGas="baseFeePerGas" :gasParameters="gasParameters" :transactionFees="transactionFees" />',
}));
