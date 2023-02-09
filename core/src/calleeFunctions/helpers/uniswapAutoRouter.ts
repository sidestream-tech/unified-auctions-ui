import { AlphaRouter } from '@uniswap/smart-order-router';
import { Protocol } from '@uniswap/router-sdk';
import { Token, Percent, TradeType, CurrencyAmount } from '@uniswap/sdk-core';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import { getActualDecimalChainIdByNetworkType } from '../../network';
import { getTokenAddressByNetworkAndSymbol, getTokenDecimalsBySymbol } from '../../tokens';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';
import { DAI_NUMBER_OF_DIGITS } from '../../constants/UNITS';
import memoizee from 'memoizee';

const routers: Record<string, AlphaRouter> = {};

const getAutoRouter = async function (network: string): Promise<AlphaRouter> {
    if (routers[network]) {
        return routers[network];
    }
    routers[network] = new AlphaRouter({
        chainId: getActualDecimalChainIdByNetworkType(network),
        provider: await getProvider(network),
    });
    return routers[network];
};

const getUniswapTokenBySymbol = async function (network: string, symbol: string): Promise<Token> {
    const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, symbol);
    const tokenDecimals = getTokenDecimalsBySymbol(symbol);
    const decimalChainId = getActualDecimalChainIdByNetworkType(network);
    return new Token(decimalChainId, tokenAddress, tokenDecimals, symbol);
};

export const getUniswapAutoRoute = async function (
    network: string,
    collateralSymbol: string,
    inputAmount: string | number = 1,
    walletAddress?: string
) {
    const collateralConfig = getCollateralConfigBySymbol(collateralSymbol);
    const router = await getAutoRouter(network);
    const inputToken = await getUniswapTokenBySymbol(network, collateralConfig.symbol);
    const outputToken = await getUniswapTokenBySymbol(network, 'DAI');

    const inputAmountInteger = new BigNumber(inputAmount).shiftedBy(collateralConfig.decimals).toFixed(0);
    const inputAmountWithCurrency = CurrencyAmount.fromRawAmount(inputToken, inputAmountInteger);

    // get auto route
    const route = await router.route(
        inputAmountWithCurrency,
        outputToken,
        TradeType.EXACT_INPUT,
        {
            recipient: walletAddress || '0x000000000000000000000000000000000000dEaD', // use given address or "dead" address as fallback
            slippageTolerance: new Percent(10, 100),
            deadline: Math.floor(Date.now() / 1000 + 1800),
        },
        {
            maxSplits: 0,
            protocols: [Protocol.V3],
        }
    );
    if (!route) {
        throw new Error(`Could not get auto route for collateral "${collateralSymbol}".`);
    }
    return route;
};

const trimRoute = (route: string[]): string[] => {
    if (route.length < 2) {
        throw new Error('Route array must have at least 2 elements.');
    }
    return route.slice(1, route.length - 1);
};

const _fetchAutoRouteInformation = async function (
    network: string,
    collateralSymbol: string,
    inputAmount: string | number = 1,
    walletAddress?: string
) {
    try {
        const autoRouteData = await getUniswapAutoRoute(network, collateralSymbol, inputAmount, walletAddress);
        const bestRoute = autoRouteData.route[0];
        const fullRoute = bestRoute.tokenPath.map(p => {
            if (!p.symbol) {
                throw new Error(`Could not get symbol for token "${p.address}".`);
            }
            return p.symbol;
        });
        const route = trimRoute(fullRoute);
        if (bestRoute.route.protocol !== Protocol.V3) {
            throw new Error('Only V3 routes are supported.');
        }
        const fees = bestRoute.route.pools.map(pool => pool.fee);
        const pools = bestRoute.route.pools.map(pool => {
            if (!pool.token1.symbol || !pool.token0.symbol) {
                throw new Error(`Could not get symbol for token from autorouter. Pool: ${pool}`);
            }
            return {
                addresses: [pool.token1.address, pool.token0.address],
                fee: pool.fee,
                routes: [pool.token1.symbol, pool.token0.symbol],
            };
        });
        const quote = new BigNumber(autoRouteData.quote.toFixed());
        const quoteGasAdjusted = new BigNumber(autoRouteData.quoteGasAdjusted.toFixed());
        return {
            totalPrice: new BigNumber(autoRouteData.quote.toFixed(DAI_NUMBER_OF_DIGITS)),
            route,
            quote,
            totalPriceAdjusted: quoteGasAdjusted,
            errorMessage: undefined,
            fees,
            pools,
        };
    } catch (error: any) {
        return {
            totalPrice: undefined,
            route: undefined,
            quote: undefined,
            fees: undefined,
            pools: undefined,
            errorMessage: error.toString(),
        };
    }
};

export const fetchAutoRouteInformation = memoizee(_fetchAutoRouteInformation, {
    promise: true,
    maxAge: 1000 * 60, // 1 minute
    length: 4,
});
