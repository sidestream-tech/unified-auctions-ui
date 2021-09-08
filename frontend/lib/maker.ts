import Maker from '@makerdao/dai';
import LiquidationPlugin from '@makerdao/dai-plugin-liquidations';
import NETWORKS from './constants/NETWORKS';

let globalMaker: typeof Maker;
let globalNetwork: string;

const getNetworkURL = function (network: string): string {
    return NETWORKS[network].url;
};

const createMaker = async function (network: string): Promise<typeof Maker> {
    const networkURL = getNetworkURL(network);
    globalNetwork = network;
    globalMaker = await Maker.create('http', {
        plugins: [[LiquidationPlugin, { vulcanize: false }]],
        provider: {
            url: networkURL,
            type: 'HTTP',
        },
        web3: {
            pollingInterval: null,
        },
        log: false,
        multicall: true,
    });
    if (typeof window !== 'undefined') {
        (window as any).maker = globalMaker;
    }
    return globalMaker;
};

const getMaker = async function (network: string): Promise<typeof Maker> {
    if (globalNetwork === network && globalMaker) {
        return globalMaker;
    }
    return await createMaker(network);
};

export default getMaker;
