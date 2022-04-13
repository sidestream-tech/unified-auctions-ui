import { GasParameters, TransactionFees } from 'auctions-core/src/types';
import faker from 'faker';
import BigNumber from 'bignumber.js';

export function generateFakeGasParameters(): GasParameters {
    return {
        maxFeePerGas: faker.datatype.number({ min: 1000000, max: 1000000000 }).toString(),
        maxPriorityFeePerGas: faker.datatype.number({ min: 1000000, max: 1000000000 }).toString(),
        gasPrice: faker.datatype.number({ min: 1000000, max: 1000000000 }).toString(),
    };
}

export function generateFakeTransactionFees(): TransactionFees {
    const biddingTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const biddingTransactionFeeDAI = biddingTransactionFeeETH.multipliedBy(1000);
    const authTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const authTransactionFeeDAI = authTransactionFeeETH.multipliedBy(1000);
    const restartTransactionFeeETH = new BigNumber(faker.datatype.float({ min: 0, max: 0.001, precision: 0.000001 }));
    const restartTransactionFeeDAI = restartTransactionFeeETH.multipliedBy(1000);

    return {
        biddingTransactionFeeETH,
        biddingTransactionFeeDAI,
        authTransactionFeeETH,
        authTransactionFeeDAI,
        restartTransactionFeeETH,
        restartTransactionFeeDAI,
    };
}
