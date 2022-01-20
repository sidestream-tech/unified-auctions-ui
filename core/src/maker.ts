import Maker from '@makerdao/dai';
import McdPlugin from '@makerdao/dai-plugin-mcd';
// TODO: upstream local changes to liquidations plugin
// import LiquidationPlugin from '@makerdao/dai-plugin-liquidations';
import LiquidationPlugin from '@sidestream/dai-plugin-liquidations';
import { getNetworkConfigByType } from './constants/NETWORKS';
import { fetchContractsAddressesByNetwork } from './contracts';

let globalMaker: typeof Maker;
let globalNetwork: string;

const createMaker = async function (network: string): Promise<typeof Maker> {
    console.info(`creating maker object with "${network}" network`);
    const networkConfig = getNetworkConfigByType(network);
    const addressOverrides = await fetchContractsAddressesByNetwork(network);
    globalNetwork = network;
    globalMaker = await Maker.create('http', {
        plugins: [
            [McdPlugin, { prefetch: false }],
            [LiquidationPlugin, { vulcanize: false }],
        ],
        smartContract: {
            addressOverrides,
        },
        provider: {
            url: networkConfig.url,
            type: 'HTTP',
        },
        web3: {
            confirmedBlockCount: 5,
            statusTimerDelay: 24 * 60 * 60 * 1000,
            pollingInterval: 3000,
            transactionSettings: {
                gasPrice: networkConfig.gasPrice,
            },
        },
        log: false,
        multicall: true,
    });
    if (typeof window !== 'undefined') {
        (window as any).maker = globalMaker;
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
    if (!globalNetwork) {
        return await createMaker(network);
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
    throw new Error('Can not initialise dai.js on a different network');
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
