import { NetworkConfig } from 'auctions-core/src/types';
import faker from 'faker';
import { random } from 'lodash';

export const generateFakeNetwork = function (): NetworkConfig {
    const chainId = faker.datatype.string(3);
    const title = faker.random.word();
    const url = faker.internet.url();
    const etherscanUrl = faker.internet.url();

    return {
        chainId,
        type: title,
        title,
        url,
        etherscanUrl,
        isFork: false,
    };
};

export const generateFakeNetworks = function (number = random(5, 15)) {
    return Array(number).fill(null).map(generateFakeNetwork);
};
