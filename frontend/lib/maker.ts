import Maker from '@makerdao/dai';
import McdPlugin from '@makerdao/dai-plugin-mcd';
// TODO: upstream local changes to liquidations plugin
// import LiquidationPlugin from '@makerdao/dai-plugin-liquidations';
import LiquidationPlugin from 'dai-monorepo/packages/dai-plugin-liquidations/src';
import NETWORKS from './constants/NETWORKS';

let globalMaker: typeof Maker;
let globalNetwork: string;

const getNetworkURL = function (network: string): string {
    return NETWORKS[network].url;
};

const createMaker = async function (network: string): Promise<typeof Maker> {
    console.info(`creating maker object with "${network}" network`);
    const networkURL = getNetworkURL(network);
    globalNetwork = network;
    globalMaker = await Maker.create('http', {
        plugins: [
            [McdPlugin, { prefetch: false }],
            [LiquidationPlugin, { vulcanize: false }],
        ],
        provider: {
            url: networkURL,
            type: 'HTTP',
        },
        web3: {
            confirmedBlockCount: 5,
            statusTimerDelay: 24 * 60 * 60 * 1000,
            pollingInterval: 3000,
        },
        log: false,
        multicall: true,
    });
    if (typeof window !== 'undefined') {
        window.maker = globalMaker;
    }
    return globalMaker;
};

const getMaker = async function (network?: string): Promise<typeof Maker> {
    if (!network) {
        if (!globalMaker) {
            throw new Error('dai.js was not yet initialised');
        }
        return globalMaker;
    }
    if (globalNetwork === network) {
        if (!globalMaker) {
            // if `getMaker` called two times at the same time,
            // we need a delay till the first execution is complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            return await getMaker(network);
        }
        return globalMaker;
    }
    return await createMaker(network);
};

export const addMakerAccount = async function (address: string, network?: string) {
    const maker = await getMaker(network);
    const accounts = maker.listAccounts();
    const isAlreadyAdded = accounts.some((a: any) => a.address.toLowerCase() === address);
    if (isAlreadyAdded) {
        await maker.useAccountWithAddress(address);
    } else {
        await maker.addAccount({ type: 'browser', autoSwitch: true });
    }
};

export default getMaker;
