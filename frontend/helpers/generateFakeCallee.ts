import { CalleeAddresses } from 'auctions-core/src/types';
import faker from 'faker';
import { random } from 'lodash';

export const generateFakeCallee = function () {
    const calleeName = faker.random.arrayElement([
        'UniswapV2CalleeDai',
        'UniswapV2LpTokenCalleeDai',
        'WstETHCurveUniv3Callee',
        'CurveLpTokenUniv3Callee',
        'UniswapV3Callee',
    ]);
    return { [calleeName]: faker.finance.ethereumAddress() };
};

export const generateFakeCallees = function (): CalleeAddresses {
    let callees = {};
    for (let i = 0; i < random(2, 5); i++) {
        callees = {
            ...callees,
            ...generateFakeCallee(),
        };
    }
    return callees as CalleeAddresses;
};
