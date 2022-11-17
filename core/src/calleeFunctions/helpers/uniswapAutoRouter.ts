import { AlphaRouter } from '@uniswap/smart-order-router';
import { Token, Percent, TradeType, CurrencyAmount } from '@uniswap/sdk-core';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import { getDecimalChainIdByNetworkType } from '../../network';
import { getTokenAddressByNetworkAndSymbol, getTokenDecimalsBySymbol } from '../../tokens';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';

const getUniswapTokenBySymbol = async function (
    network: string,
    symbol: string,
    decimalChainId?: number
): Promise<Token> {
    const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, symbol);
    const tokenDecimals = getTokenDecimalsBySymbol(symbol);
    const chainId = decimalChainId || getDecimalChainIdByNetworkType(network);
    return new Token(chainId, tokenAddress, tokenDecimals, symbol);
};

export const getUniswapAutoRoute = async function (
    network: string,
    collateralSymbol: string,
    inputAmount: string | number = 1,
    walletAddress?: string,
    decimalChainId?: number
) {
    const collateralConfig = getCollateralConfigBySymbol(collateralSymbol);
    const provider = await getProvider(network);
    const chainId = decimalChainId || getDecimalChainIdByNetworkType(network);
    const router = new AlphaRouter({ chainId, provider });
    const inputToken = await getUniswapTokenBySymbol(network, collateralConfig.symbol, chainId);
    const outputToken = await getUniswapTokenBySymbol(network, 'DAI', chainId);

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
    walletAddress?: string,
    decimalChainId: number = 1
) {
    try {
        const chainId = decimalChainId || getDecimalChainIdByNetworkType(network);
        const token = await getUniswapTokenBySymbol(network, collateralSymbol, chainId);
        const autoRouteData = await getUniswapAutoRoute(
            network,
            collateralSymbol,
            inputAmount,
            walletAddress,
            chainId
        );
        const route = autoRouteData.route[0].tokenPath.map(p => {
            if (!p.symbol) {
                throw new Error(`Could not get symbol for token "${p.address}".`);
            }
            return p.symbol;
        });
        const quote = new BigNumber(autoRouteData.quote.toFixed());
        const quoteGasAdjusted = new BigNumber(autoRouteData.quoteGasAdjusted.toFixed());

        return {
            totalPrice: new BigNumber(autoRouteData.quote.toFixed(token.decimals)),
            route,
            quote,
            quoteGasAdjusted,
            errorMessage: undefined,
        };
    } catch (error: any) {
        return {
            totalPrice: undefined,
            route: undefined,
            quote: undefined,
            errorMessage: error.toString(),
        };
    }
};
