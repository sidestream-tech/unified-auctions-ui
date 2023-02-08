import { ethers } from 'ethers';
import { getCalleeAddressByCollateralType } from '../../constants/CALLEES';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';
import { getContractAddressByName, getContractSymbolByAddress } from '../../contracts';
import { getChainIdByNetworkType } from '../../network';
import { CollateralConfig } from '../../types';
import BigNumber from '../../bignumber';
import { convertETHtoDAI } from '../../fees';

const EXPECTED_SIGNATURE = '0x12aa3caf'; // see https://www.4byte.directory/signatures/?bytes4_signature=0x12aa3caf
const CALLEE_ADDRESS = '0x0'; // TODO: fill in

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
type OneInchSwapRoute = { name: string; part: number; fromTokenAddress: string; toTokenAddress: string }[];

export const executeOneInchApiRequest = async (
    chainId: number,
    endpoint: '/swap' | '/quote' | '/liquidity-sources',
    params?: Record<string, any>
) => {
    const oneInchUrl = getOneInchUrl(chainId);
    const url = `${oneInchUrl}${endpoint}?${new URLSearchParams(params)}`;
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
    slippage = '10'
): Promise<OneInchSwapRepsonse> {
    const chainId = parseInt(getChainIdByNetworkType(network) || '', 16);
    if (Number.isNaN(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const toTokenAddress = await getContractAddressByName(network, 'DAI');
    const fromTokenAddress = await getContractAddressByName(network, collateralSymbol);
    // Documentation https://docs.1inch.io/docs/aggregation-protocol/api/swap-params/
    const swapParams = {
        fromTokenAddress,
        toTokenAddress,
        fromAddress: CALLEE_ADDRESS,
        amount,
        slippage,
        allowPartialFill: false, // disable partial fill
        disableEstimate: true, // disable eth_estimateGas
        compatibilityMode: true, // always receive parameters for the `swap` call
        protocols: (await getOneinchValidProtocols(chainId)).join(','),
    };
    const oneinchResponse = await executeOneInchApiRequest(chainId, '/swap', swapParams);
    console.info('received oneinch API response:', oneinchResponse);
    const functionSignature = ethers.utils.hexDataSlice(oneinchResponse.tx.data, 0, 4); // see https://docs.soliditylang.org/en/develop/abi-spec.html#function-selector
    if (functionSignature !== EXPECTED_SIGNATURE) {
        throw new Error(`Unexpected 1inch function signature: ${functionSignature}, expected: ${EXPECTED_SIGNATURE}`);
    }
    return oneinchResponse;
}

export async function extractPathFromSwapResponseProtocols(
    network: string,
    oneInchRoutes: OneInchSwapRoute
): Promise<string[]> {
    const pathSteps = await Promise.all(
        oneInchRoutes.map(
            async route =>
                await Promise.all([
                    getContractSymbolByAddress(network, route.fromTokenAddress),
                    getContractSymbolByAddress(network, route.toTokenAddress),
                ])
        )
    );
    const path = [pathSteps[0][0]];
    for (const step of pathSteps) {
        path.push(step[1]);
    }
    return path;
}

export async function getOneInchQuote(network: string, collateralSymbol: string, amount: string, marketId: string) {
    const chainId = parseInt(getChainIdByNetworkType(network) || '', 16);
    if (Number.isNaN(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const toTokenAddress = await getContractAddressByName(network, 'DAI');
    const fromTokenAddress = await getContractAddressByName(network, collateralSymbol);
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
        protocols: (await getOneinchValidProtocols(chainId)).join(','),
    };
    const oneinchResponse = await executeOneInchApiRequest(chainId, '/quote', swapParams);
    return {
        estimatedGas: oneinchResponse?.estimatedGas,
        route: await extractPathFromSwapResponseProtocols(network, oneinchResponse?.protocols),
        tokenOut: oneinchResponse?.toTokenAmount,
    };
}

export async function getOneInchMarketData(
    network: string,
    collateral: CollateralConfig,
    amount: BigNumber,
    marketId: string
) {
    const swapData = await getOneinchSwapParameters(network, collateral.symbol, amount.toFixed());
    const path = await extractPathFromSwapResponseProtocols(network, swapData.protocols[0]);
    const calleeData = swapData.tx.data;
    const estimatedGas = new BigNumber(
        (await getOneInchQuote(network, collateral.symbol, amount.toFixed(), marketId)).estimatedGas
    );
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
