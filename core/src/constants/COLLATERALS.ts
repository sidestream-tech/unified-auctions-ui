import type { CollateralConfig } from '../types';

const COLLATERALS: Record<string, CollateralConfig> = {
    'AAVE-A': {
        title: 'AAVE',
        ilk: 'AAVE-A',
        symbol: 'AAVE',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'BAL-A': {
        title: 'Balancer',
        ilk: 'BAL-A',
        symbol: 'BAL',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'BAT-A': {
        title: 'Basic Attention Token',
        ilk: 'BAT-A',
        symbol: 'BAT',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'COMP-A': {
        title: 'Compound',
        ilk: 'COMP-A',
        symbol: 'COMP',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'ETH-A': {
        title: 'Ether',
        ilk: 'ETH-A',
        symbol: 'ETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: [],
        },
    },
    'ETH-B': {
        title: 'Ether',
        ilk: 'ETH-B',
        symbol: 'ETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: [],
        },
    },
    'ETH-C': {
        title: 'Ether',
        ilk: 'ETH-C',
        symbol: 'ETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: [],
        },
    },
    'GUSD-A': {
        title: 'Gemini Dollar',
        ilk: 'GUSD-A',
        symbol: 'GUSD',
        decimals: 2,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'KNC-A': {
        title: 'Kyber Network Crystal',
        ilk: 'KNC-A',
        symbol: 'KNC',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'LINK-A': {
        title: 'Chainlink',
        ilk: 'LINK-A',
        symbol: 'LINK',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'LRC-A': {
        title: 'Loopring',
        ilk: 'LRC-A',
        symbol: 'LRC',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'MANA-A': {
        title: 'Decentraland',
        ilk: 'MANA-A',
        symbol: 'MANA',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'PAXUSD-A': {
        title: 'Paxos Standard',
        ilk: 'PAXUSD-A',
        symbol: 'PAXUSD',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'RENBTC-A': {
        title: 'renBTC',
        ilk: 'RENBTC-A',
        symbol: 'RENBTC',
        decimals: 8,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'TUSD-A': {
        title: 'True USD',
        ilk: 'TUSD-A',
        symbol: 'TUSD',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'UNI-A': {
        title: 'Uniswap',
        ilk: 'UNI-A',
        symbol: 'UNI',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'USDC-A': {
        title: 'USD Coin',
        ilk: 'USDC-A',
        symbol: 'USDC',
        decimals: 6,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'USDC-B': {
        title: 'USD Coin',
        ilk: 'USDC-B',
        symbol: 'USDC',
        decimals: 6,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'USDT-A': {
        title: 'Tether USD',
        ilk: 'USDT-A',
        symbol: 'USDT',
        decimals: 6,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'WBTC-A': {
        title: 'Wrapped Bitcoin',
        ilk: 'WBTC-A',
        symbol: 'WBTC',
        decimals: 8,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'WBTC-B': {
        title: 'Wrapped BTC',
        ilk: 'WBTC-B',
        symbol: 'WBTC',
        decimals: 8,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'WBTC-C': {
        title: 'Wrapped BTC',
        ilk: 'WBTC-C',
        symbol: 'WBTC',
        decimals: 8,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'YFI-A': {
        title: 'yearn.finance',
        ilk: 'YFI-A',
        symbol: 'YFI',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'ZRX-A': {
        title: '0x',
        ilk: 'ZRX-A',
        symbol: 'ZRX',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'MATIC-A': {
        title: 'Matic',
        ilk: 'MATIC-A',
        symbol: 'MATIC',
        decimals: 18,
        exchange: {
            callee: 'UniswapV3Callee',
            route: ['ETH'],
        },
    },
    'WSTETH-A': {
        title: 'Lido wstETH',
        ilk: 'WSTETH-A',
        symbol: 'WSTETH',
        decimals: 18,
        exchange: {
            callee: 'WstETHCurveUniv3Callee',
            route: [],
        },
    },
    'WSTETH-B': {
        title: 'Lido wstETH',
        ilk: 'WSTETH-B',
        symbol: 'WSTETH',
        decimals: 18,
        exchange: {
            callee: 'WstETHCurveUniv3Callee',
            route: [],
        },
    },
    'CRVV1ETHSTETH-A': {
        title: 'Curve stETH',
        ilk: 'CRVV1ETHSTETH-A',
        symbol: 'CRVV1ETHSTETH',
        decimals: 18,
        exchange: {
            callee: 'CurveLpTokenUniv3Callee',
            route: ['ETH'],
        },
    },
    'UNIV2DAIETH-A': {
        title: 'UNIV2DAIETH LP',
        ilk: 'UNIV2DAIETH-A',
        symbol: 'UNIV2DAIETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'DAI',
            token1: 'ETH',
        },
    },
    'UNIV2USDCETH-A': {
        title: 'UNIV2USDCETH LP',
        ilk: 'UNIV2USDCETH-A',
        symbol: 'UNIV2USDCETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'USDC',
            token1: 'ETH',
        },
    },
    'UNIV2ETHUSDT-A': {
        title: 'UNIV2ETHUSDT LP',
        ilk: 'UNIV2ETHUSDT-A',
        symbol: 'UNIV2ETHUSDT',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'ETH',
            token1: 'USDT',
        },
    },
    'UNIV2WBTCDAI-A': {
        title: 'UNIV2WBTCDAI LP',
        ilk: 'UNIV2WBTCDAI-A',
        symbol: 'UNIV2WBTCDAI',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'WBTC',
            token1: 'DAI',
        },
    },
    'UNIV2WBTCETH-A': {
        title: 'UNIV2WBTCETH LP',
        ilk: 'UNIV2WBTCETH-A',
        symbol: 'UNIV2WBTCETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'WBTC',
            token1: 'ETH',
        },
    },
    'UNIV2LINKETH-A': {
        title: 'UNIV2LINKETH LP',
        ilk: 'UNIV2LINKETH-A',
        symbol: 'UNIV2LINKETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'LINK',
            token1: 'ETH',
        },
    },
    'UNIV2UNIETH-A': {
        title: 'UNIV2UNIETH LP',
        ilk: 'UNIV2UNIETH-A',
        symbol: 'UNIV2UNIETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'UNI',
            token1: 'ETH',
        },
    },
    'UNIV2AAVEETH-A': {
        title: 'UNIV2AAVEETH LP',
        ilk: 'UNIV2AAVEETH-A',
        symbol: 'UNIV2AAVEETH',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'AAVE',
            token1: 'ETH',
        },
    },
    'UNIV2DAIUSDT-A': {
        title: 'UNIV2DAIUSDT LP',
        ilk: 'UNIV2DAIUSDT-A',
        symbol: 'UNIV2DAIUSDT',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'DAI',
            token1: 'USDT',
        },
    },
    'UNIV2DAIUSDC-A': {
        title: 'UNIV2DAIUSDC LP',
        ilk: 'UNIV2DAIUSDC-A',
        symbol: 'UNIV2DAIUSDC',
        decimals: 18,
        exchange: {
            callee: 'UniswapV2LpTokenCalleeDai',
            token0: 'DAI',
            token1: 'USDC',
        },
    },
};

export const getCollateralConfigBySymbol = function (symbol: string): CollateralConfig {
    const collateral = Object.values(COLLATERALS).find(c => c.symbol === symbol);
    if (!collateral) {
        throw new Error(`no collateral found for symbol "${symbol}"`);
    }
    return collateral;
};

export const getCollateralConfigByType = function (collateralType: string): CollateralConfig {
    const collateral = COLLATERALS[collateralType];
    if (!collateral) {
        throw new Error(`no collateral found for type "${collateralType}"`);
    }
    return collateral;
};

export const getAllCollateralSymbols = function (): string[] {
    const collateralSymbols = Object.values(COLLATERALS).map(collateral => collateral.symbol);
    return Array.from(new Set(collateralSymbols));
};

export const getAllCollateralTypes = function (): string[] {
    return Object.keys(COLLATERALS);
};

export default COLLATERALS;
