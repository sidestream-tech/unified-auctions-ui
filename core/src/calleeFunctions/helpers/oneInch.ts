import { ethers } from 'ethers';
import { getCalleeAddressByCollateralType } from '../../constants/CALLEES';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';
import { getErc20SymbolByAddress } from '../../contracts';
import { getDecimalChainIdByNetworkType, getNetworkConfigByType } from '../../network';
import { CollateralConfig } from '../../types';
import BigNumber from '../../bignumber';
import { getTokenAddressByNetworkAndSymbol } from '../../tokens';
import { Queue } from 'async-await-queue';
import memoizee from 'memoizee';
import { convertETHtoDAI } from '../../fees';

const MAX_DELAY_BETWEEN_REQUESTS_MS = 600;
const REQUEST_QUEUE = new Queue(1, MAX_DELAY_BETWEEN_REQUESTS_MS);
const EXPECTED_SIGNATURE = '0x12aa3caf'; // see https://www.4byte.directory/signatures/?bytes4_signature=0x12aa3caf
const SUPPORTED_1INCH_NETWORK_IDS = [1, 56, 137, 10, 42161, 100, 43114]; // see https://help.1inch.io/en/articles/5528619-how-to-use-different-networks-on-1inch
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const getOneInchUrl = (chainId: number) => {
    return `https://api.1inch.io/v5.0/${chainId}`;
};

interface Protocol {
    id: string;
    title: string;
    img: string;
    img_color: string;
}

interface OneInchToken {
    symbol: string;
    name: string;
    address: string;
    decimals: 0;
    logoURI: string;
}
interface OneInchSwapRepsonse {
    fromToken: OneInchToken;
    toToken: OneInchToken;
    toTokenAmount: string;
    fromTokenAmount: string;
    protocols: OneInchSwapRoute[];
    tx: {
        from: string;
        to: string;
        data: string;
        value: string;
        gasPrice: string;
        gas: string;
    };
}
interface LiquiditySourcesResponse {
    protocols: Protocol[];
}
type OneInchSwapRoute = { name: string; part: number; fromTokenAddress: string; toTokenAddress: string }[][];

const executeRequestInQueue = async (url: string) => {
    const apiRequestSymbol = Symbol();
    await REQUEST_QUEUE.wait(apiRequestSymbol);
    const response = await fetch(url).then(res => res.json());
    REQUEST_QUEUE.end(apiRequestSymbol);
    return response;
};

export const executeOneInchApiRequest = async (
    chainId: number,
    endpoint: '/swap' | '/liquidity-sources',
    params?: Record<string, any>
) => {
    const oneInchUrl = getOneInchUrl(chainId);
    const url = `${oneInchUrl}${endpoint}?${new URLSearchParams(params)}`;
    const response = await executeRequestInQueue(url);
    if (response.error) {
        throw new Error(`failed to receive response from oneinch: ${response.error}`);
    }
    return response;
};

async function _getOneinchValidProtocols(chainId: number) {
    // Fetch all supported protocols except for the limit orders
    const response: LiquiditySourcesResponse = await executeOneInchApiRequest(chainId, '/liquidity-sources');
    const protocolIds = response.protocols.map(protocol => protocol.id);
    return protocolIds.filter(protocolId => !protocolId.toLowerCase().includes('limit'));
}

export const getOneinchValidProtocols = memoizee(_getOneinchValidProtocols, {
    promise: true,
    length: 1,
    maxAge: ONE_DAY_MS,
});

export async function getOneinchSwapParameters(
    network: string,
    collateralSymbol: string,
    amount: string,
    marketId: string,
    slippage = '1'
): Promise<OneInchSwapRepsonse> {
    const isFork = getNetworkConfigByType(network).isFork;
    const chainId = isFork ? 1 : getDecimalChainIdByNetworkType(network);
    if (!isFork && !SUPPORTED_1INCH_NETWORK_IDS.includes(chainId)) {
        throw new Error(`1inch does not support network ${network}`);
    }
    const toTokenAddress = await getTokenAddressByNetworkAndSymbol(network, 'DAI');
    const fromTokenAddress = await getTokenAddressByNetworkAndSymbol(network, collateralSymbol);
    const calleeAddress = getCalleeAddressByCollateralType(
        network,
        getCollateralConfigBySymbol(collateralSymbol).ilk,
        marketId
    );
    // Documentation https://docs.1inch.io/docs/aggregation-protocol/api/swap-params/
    const swapParams = {
        fromTokenAddress,
        toTokenAddress,
        fromAddress: calleeAddress,
        amount,
        slippage,
        allowPartialFill: false, // disable partial fill
        disableEstimate: true, // disable eth_estimateGas
        compatibilityMode: true, // always receive parameters for the `swap` call
    };
    const oneinchResponse = await executeOneInchApiRequest(chainId, '/swap', swapParams);
    const functionSignature = ethers.utils.hexDataSlice(oneinchResponse.tx.data, 0, 4); // see https://docs.soliditylang.org/en/develop/abi-spec.html#function-selector
    if (functionSignature !== EXPECTED_SIGNATURE) {
        throw new Error(`Unexpected 1inch function signature: ${functionSignature}, expected: ${EXPECTED_SIGNATURE}`);
    }
    return oneinchResponse;
}

export async function extractPathFromSwapResponseProtocols(
    network: string,
    oneInchRoutes: OneInchSwapRoute[]
): Promise<string[]> {
    const pathStepsResolves = await Promise.all(
        oneInchRoutes[0].map(async route => {
            return await Promise.all([
                await getErc20SymbolByAddress(network, route[0].fromTokenAddress),
                await getErc20SymbolByAddress(network, route[0].toTokenAddress),
            ]);
        })
    );
    const path = [pathStepsResolves[0][0]];
    for (const step of pathStepsResolves) {
        path.push(step[1]);
    }
    return path;
}

export async function getOneInchMarketData(
    network: string,
    collateral: CollateralConfig,
    amount: BigNumber,
    marketId: string
) {
    const swapData = await getOneinchSwapParameters(
        network,
        collateral.symbol,
        amount.shiftedBy(collateral.decimals).toFixed(0),
        marketId
    );
    const path = await extractPathFromSwapResponseProtocols(network, swapData.protocols);
    const calleeData = swapData.tx.data;
    const estimatedGas = swapData.tx.gas;
    const exchangeFeeEth = new BigNumber(swapData.tx.gasPrice).multipliedBy(estimatedGas);
    const exchangeFeeDai = await convertETHtoDAI(network, exchangeFeeEth);
    const to = swapData.tx.to;
    return {
        path,
        exchangeFeeEth,
        exchangeFeeDai,
        calleeData,
        to,
    };
}
