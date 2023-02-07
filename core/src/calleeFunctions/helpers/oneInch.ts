import { ethers } from 'ethers';
import { getContractSymbolByAddress } from '../../contracts';
import { Pool } from '../../types';

const EXPECTED_SIGNATURE = '0x12aa3caf'; // see https://www.4byte.directory/signatures/?bytes4_signature=0x12aa3caf

export const getOneInchUrl = (chainId: number) => {
    return `https://api.1inch.io/v5.0/${chainId}`;
};

interface Protocol {
    id: string;
    title: string;
    img: string;
    img_color: string;
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
    chainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    calleeAddress: string,
    amount: string,
    slippage: string
) {
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

export async function extractPoolsFromSwapResponseProtocols(
    network: string,
    oneInchRoutes: OneInchSwapRoute
): Promise<Pool[]> {
    return await Promise.all(
        oneInchRoutes.map(async route => ({
            routes: await Promise.all([
                getContractSymbolByAddress(network, route.fromTokenAddress),
                getContractSymbolByAddress(network, route.toTokenAddress),
            ]),
            fee: 3000,
            addresses: [route.fromTokenAddress, route.toTokenAddress],
        }))
    );
}

export const fetchAutoRouteInformation = async function () {
    // 0. get autoRouteData
    // 1. extract route from response
    // 2. trim route if needed
    // 3. feel fees in
    // 4. derive quote from input amount
    // 5. derive quote gas adjusted from input amount, gas price and gas
    // ( can have estimated gas from the api)
};

export const encodePools = async function (_network: string, pools: Pool[]): Promise<string> {
    const types = [] as string[];
    const values = [] as Array<string | number>;

    for (const pool of pools) {
        types.push('address');
        values.push(pool.addresses[0]);

        types.push('uint24');
        values.push(pool.fee);
    }
    types.push('address');
    values.push(pools[pools.length - 1].addresses[1]);
    return ethers.utils.solidityPack(types, values);
};
