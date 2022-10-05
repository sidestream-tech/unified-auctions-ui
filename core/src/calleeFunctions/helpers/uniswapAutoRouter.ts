import { AlphaRouter } from '@uniswap/smart-order-router';
import { Token, Percent, TradeType, CurrencyAmount } from '@uniswap/sdk-core';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import { ETH_NUMBER_OF_DIGITS } from '../../constants/UNITS';
import { getDecimalChainIdByNetworkType } from '../../network';
import { getTokenAddressByNetworkAndSymbol, getTokenDecimalsBySymbol } from '../../tokens';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';

const getUniswapTokenBySymbol = async function (network: string, symbol: string): Promise<Token> {
    const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, symbol);
    const tokenDecimals = getTokenDecimalsBySymbol(symbol);
    const decimalChainId = getDecimalChainIdByNetworkType(network);
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
    const router = new AlphaRouter({ chainId: 1, provider });
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
        }
    );
    if (!route) {
        throw new Error(`Could not get auto route for collateral "${collateralSymbol}".`);
    }
    console.log(`autoroute for ${collateralSymbol}`, route);
    return route;
};
