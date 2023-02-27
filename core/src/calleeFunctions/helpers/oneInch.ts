import { ethers } from 'ethers';
import { getCalleeAddressByCollateralType } from '../../constants/CALLEES';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';
import { getErc20SymbolByAddress } from '../../contracts';
import { getChainIdByNetworkType, getNetworkConfigByType } from '../../network';
import { CollateralConfig } from '../../types';
import BigNumber from '../../bignumber';
import { getTokenAddressByNetworkAndSymbol } from '../../tokens';
import { WAD_NUMBER_OF_DIGITS } from '../../constants/UNITS';
import { RateLimiter } from 'limiter';

const REQUEST_LIMITER = new RateLimiter({ tokensPerInterval: 1, interval: 'second' });
const EXPECTED_SIGNATURE = '0x12aa3caf'; // see https://www.4byte.directory/signatures/?bytes4_signature=0x12aa3caf
const SUPPORTED_1INCH_NETWORK_IDS = [1, 56, 137, 10, 42161, 100, 43114];

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

export const executeOneInchApiRequest = async (
    chainId: number,
    endpoint: '/swap' | '/quote' | '/liquidity-sources',
    params?: Record<string, any>
) => {
    const oneInchUrl = getOneInchUrl(chainId);
    const url = `${oneInchUrl}${endpoint}?${new URLSearchParams(params)}`;
    await REQUEST_LIMITER.removeTokens(1);
    const response = await fetch(url).then(res => res.json());
    if (response.error) {
        throw new Error(`failed to receive response from oneinch: ${response.error}`);
    }
    return response;
};

export async function getOneinchValidProtocols(chainId: number) {
    // Fetch all supported protocols except for the limit orders
    const response: LiquiditySourcesResponse = await executeOneInchApiRequest(chainId, '/liquidity-sources');
    const protocolIds = response.protocols.map(protocol => protocol.id);
    return protocolIds.filter(protocolId => !protocolId.toLowerCase().includes('limit'));
}

export async function getOneinchSwapParameters(
    network: string,
    collateralSymbol: string,
    amount: string,
    marketId: string,
    slippage = '10'
): Promise<OneInchSwapRepsonse> {
    const chainId = getNetworkConfigByType(network).isFork ? 1 : parseInt(getChainIdByNetworkType(network) || '', 16);
    if (!SUPPORTED_1INCH_NETWORK_IDS.includes(chainId)) {
        throw new Error(`1inch does not support network ${network}`);
    }
    if (Number.isNaN(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
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
        amount.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        marketId
    );
    const path = await extractPathFromSwapResponseProtocols(network, swapData.protocols);
    const calleeData = swapData.tx.data;
    const estimatedGas = swapData.tx.gas;
    const exchangeFeeEth = new BigNumber(swapData.tx.gasPrice).multipliedBy(estimatedGas);
    const exchangeFeeDai = new BigNumber(10).multipliedBy(exchangeFeeEth); // await convertETHtoDAI(network, exchangeFeeEth); TODO: uncomment
    const to = swapData.tx.to;
    return {
        path,
        exchangeFeeEth,
        exchangeFeeDai,
        calleeData,
        to,
    };
}
