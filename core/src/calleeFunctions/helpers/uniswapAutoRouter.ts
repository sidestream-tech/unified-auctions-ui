import { AlphaRouter } from '@uniswap/smart-order-router';
import { Token, Percent, TradeType, CurrencyAmount } from '@uniswap/sdk-core';
import BigNumber from '../../bignumber';
import getProvider from '../../provider';
import { ETH_NUMBER_OF_DIGITS } from '../../constants/UNITS';
import { getDecimalChainIdByNetworkType } from '../../network';
import { getTokenAddressByNetworkAndSymbol, getTokenDecimalsBySymbol } from '../../tokens';

// const V3_SWAP_ROUTER_ADDRESS = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45';

const getUniswapTokenBySymbol = async function (network: string, symbol: string): Promise<Token> {
    const tokenAddress = await getTokenAddressByNetworkAndSymbol(network, symbol);
    const tokenDecimals = getTokenDecimalsBySymbol(symbol);
    const decimalChainId = getDecimalChainIdByNetworkType(network);
    return new Token(decimalChainId, tokenAddress, tokenDecimals, symbol);
};

export const getTestQuote = async function (network: string, walletAddress: string, inputAmount: string | number = 1) {
    // Test function to get price of 1 intput token into DAI and the best route
    const INPUT_TOKEN_NAME = 'ETH';

    // prepare router
    const provider = await getProvider(network);
    const router = new AlphaRouter({ chainId: 1, provider });
    const inputToken = await getUniswapTokenBySymbol(network, INPUT_TOKEN_NAME);
    const outputToken = await getUniswapTokenBySymbol(network, 'DAI');

    // set amounts
    const inputAmountInteger = new BigNumber(inputAmount).shiftedBy(ETH_NUMBER_OF_DIGITS).toFixed(0);
    const inputAmountWithCurrency = CurrencyAmount.fromRawAmount(inputToken, inputAmountInteger);

    // get auto route
    const route = await router.route(
        inputAmountWithCurrency,
        outputToken,
        TradeType.EXACT_INPUT,
        {
            recipient: walletAddress,
            slippageTolerance: new Percent(10, 100),
            deadline: Math.floor(Date.now() / 1000 + 1800),
        },
        {
            maxSplits: 0,
        }
    );
    if (!route) {
        throw new Error('the route is null, probably the input parameters are invalid');
    }

    // print results
    console.log(`Quote Exact In: ${route.quote.toFixed(2)}`);
    console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`);
    console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`);
    console.log('route', route);
};
