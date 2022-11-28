import { AlphaRouter } from '@uniswap/smart-order-router';
import { Protocol } from '@uniswap/router-sdk';
import { Token, Percent, TradeType, CurrencyAmount } from '@uniswap/sdk-core';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import { getActualDecimalChainIdByNetworkType } from '../../network';
import { getTokenAddressByNetworkAndSymbol, getTokenDecimalsBySymbol } from '../../tokens';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';
import { DAI_NUMBER_OF_DIGITS } from '../../constants/UNITS';

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
    const provider = await getProvider(network);
    const router = new AlphaRouter({
        chainId: getActualDecimalChainIdByNetworkType(network),
        provider,
    });
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

export const fetchAutoRouteInformation = async function (
    network: string,
    collateralSymbol: string,
    inputAmount: string | number = 1,
    walletAddress?: string
) {
    try {
        const autoRouteData = await getUniswapAutoRoute(network, collateralSymbol, inputAmount, walletAddress);
        const bestRoute = autoRouteData.route[0]
        const route = bestRoute.tokenPath.map(p => {
            if (!p.symbol) {
                throw new Error(`Could not get symbol for token "${p.address}".`);
            }
            return p.symbol;
        });
        if( bestRoute.route.protocol !== Protocol.V3 ) {
            throw new Error('Only V3 routes are supported.');
        }
        const fees = bestRoute.route.pools.map(pool => pool.fee)
        const quote = new BigNumber(autoRouteData.quote.toFixed());
        const quoteGasAdjusted = new BigNumber(autoRouteData.quoteGasAdjusted.toFixed());
        return {
            totalPrice: new BigNumber(autoRouteData.quote.toFixed(DAI_NUMBER_OF_DIGITS)),
            route,
            quote,
            quoteGasAdjusted,
            errorMessage: undefined,
            fees,
        };
    } catch (error: any) {
        return {
            totalPrice: undefined,
            route: undefined,
            quote: undefined,
            fees: undefined,
            errorMessage: error.toString(),
        };
    }
};
