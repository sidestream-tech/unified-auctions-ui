import type { CollateralConfig, OracleCurrentAndNextPrices, OracleCurrentPriceOnly } from '../types';

export const ORACLE_WITH_DELAY: OracleCurrentAndNextPrices = {
    type: 'CurrentAndNextPrice',
    hasDelay: true,
    currentPriceSlotAddress: '0x3',
    slotPriceValueBeginsAtPosition: 34,
    nextPriceSlotAddress: '0x4',
};
export const ORACLE_WITHOUT_DELAY: OracleCurrentPriceOnly = {
    type: 'CurrentPriceOnly',
    hasDelay: false,
    currentPriceSlotAddress: '0x2',
    slotPriceValueBeginsAtPosition: 0,
    currentPriceValiditySlotAndOffset: { slot: '0x1', offset: 25 },
};

const COLLATERALS: Record<string, CollateralConfig> = {
    'AAVE-A': {
        title: 'AAVE',
        ilk: 'AAVE-A',
        symbol: 'AAVE',
        tokenName: 'AAVE',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'AAVE',
            pip: 'PIP_AAVE',
            join: 'MCD_JOIN_AAVE_A',
            clip: 'MCD_CLIP_AAVE_A',
            calc: 'MCD_CLIP_CALC_AAVE_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['AAVE', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['AAVE', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'BAL-A': {
        title: 'Balancer',
        ilk: 'BAL-A',
        symbol: 'BAL',
        tokenName: 'BAL',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'BAL',
            pip: 'PIP_BAL',
            join: 'MCD_JOIN_BAL_A',
            clip: 'MCD_CLIP_BAL_A',
            calc: 'MCD_CLIP_CALC_BAL_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['BAL', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['BAL', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'BAT-A': {
        title: 'Basic Attention Token',
        ilk: 'BAT-A',
        symbol: 'BAT',
        tokenName: 'BAT',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'BAT',
            pip: 'PIP_BAT',
            join: 'MCD_JOIN_BAT_A',
            clip: 'MCD_CLIP_BAT_A',
            calc: 'MCD_CLIP_CALC_BAT_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['BAL', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['BAL', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'COMP-A': {
        title: 'Compound',
        ilk: 'COMP-A',
        symbol: 'COMP',
        tokenName: 'COMP',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'COMP',
            pip: 'PIP_COMP',
            join: 'MCD_JOIN_COMP_A',
            clip: 'MCD_CLIP_COMP_A',
            calc: 'MCD_CLIP_CALC_COMP_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['COMP', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['COMP', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'GNO-A': {
        title: 'Gnosis Token',
        ilk: 'GNO-A',
        symbol: 'GNO',
        tokenName: 'GNO',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'GNO',
            pip: 'PIP_GNO',
            join: 'MCD_JOIN_GNO_A',
            clip: 'MCD_CLIP_GNO_A',
            calc: 'MCD_CLIP_CALC_GNO_A',
        },
        exchanges: {
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['GNO', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['GNO', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'ETH-A': {
        title: 'Ether',
        ilk: 'ETH-A',
        symbol: 'ETH',
        tokenName: 'ETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'ETH',
            pip: 'PIP_ETH',
            join: 'MCD_JOIN_ETH_A',
            clip: 'MCD_CLIP_ETH_A',
            calc: 'MCD_CLIP_CALC_ETH_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'ETH-B': {
        title: 'Ether',
        ilk: 'ETH-B',
        symbol: 'ETH',
        tokenName: 'ETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'ETH',
            pip: 'PIP_ETH',
            join: 'MCD_JOIN_ETH_B',
            clip: 'MCD_CLIP_ETH_B',
            calc: 'MCD_CLIP_CALC_ETH_B',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'ETH-C': {
        title: 'Ether',
        ilk: 'ETH-C',
        symbol: 'ETH',
        tokenName: 'ETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'ETH',
            pip: 'PIP_ETH',
            join: 'MCD_JOIN_ETH_C',
            clip: 'MCD_CLIP_ETH_C',
            calc: 'MCD_CLIP_CALC_ETH_C',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'GUSD-A': {
        title: 'Gemini Dollar',
        ilk: 'GUSD-A',
        symbol: 'GUSD',
        tokenName: 'GUSD',
        decimals: 2,
        isActive: false,
        contracts: {
            token: 'GUSD',
            pip: 'PIP_GUSD',
            join: 'MCD_JOIN_GUSD_A',
            clip: 'MCD_CLIP_GUSD_A',
            calc: 'MCD_CLIP_CALC_GUSD_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['GUSD', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['GUSD', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITHOUT_DELAY,
    },
    'KNC-A': {
        title: 'Kyber Network Crystal',
        ilk: 'KNC-A',
        symbol: 'KNC',
        tokenName: 'KNC',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'KNC',
            pip: 'PIP_KNC',
            join: 'MCD_JOIN_KNC_A',
            clip: 'MCD_CLIP_KNC_A',
            calc: 'MCD_CLIP_CALC_KNC_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['KNC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['KNC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'LINK-A': {
        title: 'Chainlink',
        ilk: 'LINK-A',
        symbol: 'LINK',
        tokenName: 'LINK',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'LINK',
            pip: 'PIP_LINK',
            join: 'MCD_JOIN_LINK_A',
            clip: 'MCD_CLIP_LINK_A',
            calc: 'MCD_CLIP_CALC_LINK_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['LINK', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['LINK', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'LRC-A': {
        title: 'Loopring',
        ilk: 'LRC-A',
        symbol: 'LRC',
        tokenName: 'LRC',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'LRC',
            pip: 'PIP_LRC',
            join: 'MCD_JOIN_LRC_A',
            clip: 'MCD_CLIP_LRC_A',
            calc: 'MCD_CLIP_CALC_LRC_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['LRC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['LRC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'MANA-A': {
        title: 'Decentraland',
        ilk: 'MANA-A',
        symbol: 'MANA',
        tokenName: 'MANA',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'MANA',
            pip: 'PIP_MANA',
            join: 'MCD_JOIN_MANA_A',
            clip: 'MCD_CLIP_MANA_A',
            calc: 'MCD_CLIP_CALC_MANA_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['MANA', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['MANA', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'PAXUSD-A': {
        title: 'Paxos Standard',
        ilk: 'PAXUSD-A',
        symbol: 'PAXUSD',
        tokenName: 'PAXUSD',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'PAXUSD',
            pip: 'PIP_PAXUSD',
            join: 'MCD_JOIN_PAXUSD_A',
            clip: 'MCD_CLIP_PAXUSD_A',
            calc: 'MCD_CLIP_CALC_PAXUSD_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['PAXUSD', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['PAXUSD', 'ETH', 'DAI'],
            },
        },

        oracle: ORACLE_WITHOUT_DELAY,
    },
    'RENBTC-A': {
        title: 'renBTC',
        ilk: 'RENBTC-A',
        symbol: 'RENBTC',
        tokenName: 'RENBTC',
        decimals: 8,
        isActive: false,
        contracts: {
            token: 'RENBTC',
            pip: 'PIP_RENBTC',
            join: 'MCD_JOIN_RENBTC_A',
            clip: 'MCD_CLIP_RENBTC_A',
            calc: 'MCD_CLIP_CALC_RENBTC_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['RENBTC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['RENBTC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'TUSD-A': {
        title: 'True USD',
        ilk: 'TUSD-A',
        symbol: 'TUSD',
        tokenName: 'TUSD',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'TUSD',
            pip: 'PIP_TUSD',
            join: 'MCD_JOIN_TUSD_A',
            clip: 'MCD_CLIP_TUSD_A',
            calc: 'MCD_CLIP_CALC_TUSD_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['TUSD', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['TUSD', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITHOUT_DELAY,
    },
    'UNI-A': {
        title: 'Uniswap',
        ilk: 'UNI-A',
        symbol: 'UNI',
        tokenName: 'UNI',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNI',
            pip: 'PIP_UNI',
            join: 'MCD_JOIN_UNI_A',
            clip: 'MCD_CLIP_UNI_A',
            calc: 'MCD_CLIP_CALC_UNI_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['UNI', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['UNI', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'USDC-A': {
        title: 'USD Coin',
        ilk: 'USDC-A',
        symbol: 'USDC',
        tokenName: 'USDC',
        decimals: 6,
        isActive: false,
        contracts: {
            token: 'USDC',
            pip: 'PIP_USDC',
            join: 'MCD_JOIN_USDC_A',
            clip: 'MCD_CLIP_USDC_A',
            calc: 'MCD_CLIP_CALC_USDC_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['USDC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['USDC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITHOUT_DELAY,
    },
    'USDC-B': {
        title: 'USD Coin',
        ilk: 'USDC-B',
        symbol: 'USDC',
        tokenName: 'USDC',
        decimals: 6,
        isActive: false,
        contracts: {
            token: 'USDC',
            pip: 'PIP_USDC',
            join: 'MCD_JOIN_USDC_A',
            clip: 'MCD_CLIP_USDC_B',
            calc: 'MCD_CLIP_CALC_USDC_B',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['USDC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['USDC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITHOUT_DELAY,
    },
    'USDT-A': {
        title: 'Tether USD',
        ilk: 'USDT-A',
        symbol: 'USDT',
        tokenName: 'USDT',
        decimals: 6,
        isActive: false,
        contracts: {
            token: 'USDT',
            pip: 'PIP_USDT',
            join: 'MCD_JOIN_USDT_A',
            clip: 'MCD_CLIP_USDT_A',
            calc: 'MCD_CLIP_CALC_USDT_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['USDT', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['USDT', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WBTC-A': {
        title: 'Wrapped Bitcoin',
        ilk: 'WBTC-A',
        symbol: 'WBTC',
        tokenName: 'WBTC',
        decimals: 8,
        isActive: true,
        contracts: {
            token: 'WBTC',
            pip: 'PIP_WBTC',
            join: 'MCD_JOIN_WBTC_A',
            clip: 'MCD_CLIP_WBTC_A',
            calc: 'MCD_CLIP_CALC_WBTC_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['WBTC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['WBTC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WBTC-B': {
        title: 'Wrapped BTC',
        ilk: 'WBTC-B',
        symbol: 'WBTC',
        tokenName: 'WBTC',
        decimals: 8,
        isActive: true,
        contracts: {
            token: 'WBTC',
            pip: 'PIP_WBTC',
            join: 'MCD_JOIN_WBTC_B',
            clip: 'MCD_CLIP_WBTC_B',
            calc: 'MCD_CLIP_CALC_WBTC_B',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['WBTC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['WBTC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WBTC-C': {
        title: 'Wrapped BTC',
        ilk: 'WBTC-C',
        symbol: 'WBTC',
        tokenName: 'WBTC',
        decimals: 8,
        isActive: true,
        contracts: {
            token: 'WBTC',
            pip: 'PIP_WBTC',
            join: 'MCD_JOIN_WBTC_C',
            clip: 'MCD_CLIP_WBTC_C',
            calc: 'MCD_CLIP_CALC_WBTC_C',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['WBTC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['WBTC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'YFI-A': {
        title: 'yearn.finance',
        ilk: 'YFI-A',
        symbol: 'YFI',
        tokenName: 'YFI',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'YFI',
            pip: 'PIP_YFI',
            join: 'MCD_JOIN_YFI_A',
            clip: 'MCD_CLIP_YFI_A',
            calc: 'MCD_CLIP_CALC_YFI_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['YFI', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['YFI', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'ZRX-A': {
        title: '0x',
        ilk: 'ZRX-A',
        symbol: 'ZRX',
        tokenName: 'ZRX',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'ZRX',
            pip: 'PIP_ZRX',
            join: 'MCD_JOIN_ZRX_A',
            clip: 'MCD_CLIP_ZRX_A',
            calc: 'MCD_CLIP_CALC_ZRX_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['ZRX', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['ZRX', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'MATIC-A': {
        title: 'Matic',
        ilk: 'MATIC-A',
        symbol: 'MATIC',
        tokenName: 'MATIC',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'MATIC',
            pip: 'PIP_MATIC',
            join: 'MCD_JOIN_MATIC_A',
            clip: 'MCD_CLIP_MATIC_A',
            calc: 'MCD_CLIP_CALC_MATIC_A',
        },
        exchanges: {
            'Uniswap V3 Autorouter': {
                callee: 'UniswapV3Callee',
                automaticRouter: true,
            },
            'Uniswap V3': {
                callee: 'UniswapV3Callee',
                route: ['MATIC', 'ETH', 'DAI'],
            },
            'Uniswap V2': {
                callee: 'UniswapV2CalleeDai',
                route: ['MATIC', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WSTETH-A': {
        title: 'Lido wstETH',
        ilk: 'WSTETH-A',
        symbol: 'WSTETH',
        tokenName: 'WSTETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'WSTETH',
            pip: 'PIP_WSTETH',
            join: 'MCD_JOIN_WSTETH_A',
            clip: 'MCD_CLIP_WSTETH_A',
            calc: 'MCD_CLIP_CALC_WSTETH_A',
        },
        exchanges: {
            'Curve wstETH V3': {
                callee: 'WstETHCurveUniv3Callee',
                route: ['WSTETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'WSTETH-B': {
        title: 'Lido wstETH',
        ilk: 'WSTETH-B',
        symbol: 'WSTETH',
        tokenName: 'WSTETH',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'WSTETH',
            pip: 'PIP_WSTETH',
            join: 'MCD_JOIN_WSTETH_B',
            clip: 'MCD_CLIP_WSTETH_B',
            calc: 'MCD_CLIP_CALC_WSTETH_B',
        },
        exchanges: {
            'Curve wstETH V3': {
                callee: 'WstETHCurveUniv3Callee',
                route: ['WSTETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'CRVV1ETHSTETH-A': {
        title: 'Curve stETH',
        ilk: 'CRVV1ETHSTETH-A',
        symbol: 'CRVV1ETHSTETH',
        tokenName: 'CRVV1ETHSTETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'CRVV1ETHSTETH',
            pip: 'PIP_CRVV1ETHSTETH',
            join: 'MCD_JOIN_CRVV1ETHSTETH_A',
            clip: 'MCD_CLIP_CRVV1ETHSTETH_A',
            calc: 'MCD_CLIP_CALC_CRVV1ETHSTETH_A',
        },
        exchanges: {
            'Curve Token V3': {
                callee: 'CurveLpTokenUniv3Callee',
                route: ['ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2DAIETH-A': {
        title: 'UNIV2DAIETH LP',
        ilk: 'UNIV2DAIETH-A',
        symbol: 'UNIV2DAIETH',
        tokenName: 'UNIV2DAIETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2DAIETH',
            pip: 'PIP_UNIV2DAIETH',
            join: 'MCD_JOIN_UNIV2DAIETH_A',
            clip: 'MCD_CLIP_UNIV2DAIETH_A',
            calc: 'MCD_CLIP_CALC_UNIV2DAIETH_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'DAI',
                token1: 'ETH',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2USDCETH-A': {
        title: 'UNIV2USDCETH LP',
        ilk: 'UNIV2USDCETH-A',
        symbol: 'UNIV2USDCETH',
        tokenName: 'UNIV2USDCETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2USDCETH',
            pip: 'PIP_UNIV2USDCETH',
            join: 'MCD_JOIN_UNIV2USDCETH_A',
            clip: 'MCD_CLIP_UNIV2USDCETH_A',
            calc: 'MCD_CLIP_CALC_UNIV2USDCETH_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'USDC',
                token1: 'ETH',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2ETHUSDT-A': {
        title: 'UNIV2ETHUSDT LP',
        ilk: 'UNIV2ETHUSDT-A',
        symbol: 'UNIV2ETHUSDT',
        tokenName: 'UNIV2ETHUSDT',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2ETHUSDT',
            pip: 'PIP_UNIV2ETHUSDT',
            join: 'MCD_JOIN_UNIV2ETHUSDT_A',
            clip: 'MCD_CLIP_UNIV2ETHUSDT_A',
            calc: 'MCD_CLIP_CALC_UNIV2ETHUSDT_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'ETH',
                token1: 'USDT',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2WBTCDAI-A': {
        title: 'UNIV2WBTCDAI LP',
        ilk: 'UNIV2WBTCDAI-A',
        symbol: 'UNIV2WBTCDAI',
        tokenName: 'UNIV2WBTCDAI',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2WBTCDAI',
            pip: 'PIP_UNIV2WBTCDAI',
            join: 'MCD_JOIN_UNIV2WBTCDAI_A',
            clip: 'MCD_CLIP_UNIV2WBTCDAI_A',
            calc: 'MCD_CLIP_CALC_UNIV2WBTCDAI_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'WBTC',
                token1: 'DAI',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2WBTCETH-A': {
        title: 'UNIV2WBTCETH LP',
        ilk: 'UNIV2WBTCETH-A',
        symbol: 'UNIV2WBTCETH',
        tokenName: 'UNIV2WBTCETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2WBTCETH',
            pip: 'PIP_UNIV2WBTCETH',
            join: 'MCD_JOIN_UNIV2WBTCETH_A',
            clip: 'MCD_CLIP_UNIV2WBTCETH_A',
            calc: 'MCD_CLIP_CALC_UNIV2WBTCETH_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'WBTC',
                token1: 'ETH',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2LINKETH-A': {
        title: 'UNIV2LINKETH LP',
        ilk: 'UNIV2LINKETH-A',
        symbol: 'UNIV2LINKETH',
        tokenName: 'UNIV2LINKETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2LINKETH',
            pip: 'PIP_UNIV2LINKETH',
            join: 'MCD_JOIN_UNIV2LINKETH_A',
            clip: 'MCD_CLIP_UNIV2LINKETH_A',
            calc: 'MCD_CLIP_CALC_UNIV2LINKETH_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'LINK',
                token1: 'ETH',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2UNIETH-A': {
        title: 'UNIV2UNIETH LP',
        ilk: 'UNIV2UNIETH-A',
        symbol: 'UNIV2UNIETH',
        tokenName: 'UNIV2UNIETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2UNIETH',
            pip: 'PIP_UNIV2UNIETH',
            join: 'MCD_JOIN_UNIV2UNIETH_A',
            clip: 'MCD_CLIP_UNIV2UNIETH_A',
            calc: 'MCD_CLIP_CALC_UNIV2UNIETH_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'UNI',
                token1: 'ETH',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2AAVEETH-A': {
        title: 'UNIV2AAVEETH LP',
        ilk: 'UNIV2AAVEETH-A',
        symbol: 'UNIV2AAVEETH',
        tokenName: 'UNIV2AAVEETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2AAVEETH',
            pip: 'PIP_UNIV2AAVEETH',
            join: 'MCD_JOIN_UNIV2AAVEETH_A',
            clip: 'MCD_CLIP_UNIV2AAVEETH_A',
            calc: 'MCD_CLIP_CALC_UNIV2AAVEETH_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'AAVE',
                token1: 'ETH',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2DAIUSDT-A': {
        title: 'UNIV2DAIUSDT LP',
        ilk: 'UNIV2DAIUSDT-A',
        symbol: 'UNIV2DAIUSDT',
        tokenName: 'UNIV2DAIUSDT',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2DAIUSDT',
            pip: 'PIP_UNIV2DAIUSDT',
            join: 'MCD_JOIN_UNIV2DAIUSDT_A',
            clip: 'MCD_CLIP_UNIV2DAIUSDT_A',
            calc: 'MCD_CLIP_CALC_UNIV2DAIUSDT_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'DAI',
                token1: 'USDT',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'UNIV2DAIUSDC-A': {
        title: 'UNIV2DAIUSDC LP',
        ilk: 'UNIV2DAIUSDC-A',
        symbol: 'UNIV2DAIUSDC',
        tokenName: 'UNIV2DAIUSDC',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'UNIV2DAIUSDC',
            pip: 'PIP_UNIV2DAIUSDC',
            join: 'MCD_JOIN_UNIV2DAIUSDC_A',
            clip: 'MCD_CLIP_UNIV2DAIUSDC_A',
            calc: 'MCD_CLIP_CALC_UNIV2DAIUSDC_A',
        },
        exchanges: {
            'Uniswap Token V2': {
                callee: 'UniswapV2LpTokenCalleeDai',
                token0: 'DAI',
                token1: 'USDC',
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'RETH-A': {
        title: 'Rocket Pool ETH',
        ilk: 'RETH-A',
        symbol: 'RETH',
        tokenName: 'RETH',
        decimals: 18,
        isActive: false,
        contracts: {
            token: 'RETH',
            pip: 'PIP_RETH',
            join: 'MCD_JOIN_RETH_A',
            clip: 'MCD_CLIP_RETH_A',
            calc: 'MCD_CLIP_CALC_RETH_A',
        },
        exchanges: {
            'Curve rETH V3': {
                callee: 'rETHCurveUniv3Callee',
                route: ['RETH', 'ETH', 'DAI'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
    },
    'LSE-MKR-A': {
        title: 'Lockstake MKR',
        ilk: 'LSE-MKR-A',
        symbol: 'MCD_GOV',
        tokenName: 'MKR',
        decimals: 18,
        isActive: true,
        contracts: {
            token: 'MCD_GOV',
            pip: 'PIP_MKR',
            clip: 'LOCKSTAKE_CLIP',
            calc: 'LOCKSTAKE_CLIP_CALC',
        },
        exchanges: {
            'Uniswap V2': {
                callee: 'UniswapV2LockstakeCallee',
                route: ['SKY', 'USDS'],
            },
        },
        oracle: ORACLE_WITH_DELAY,
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
    return Array.from(new Set(collateralSymbols)).sort();
};

export const getAllCollateralTypes = function (): string[] {
    return Object.keys(COLLATERALS).sort();
};

export const getActiveCollateralTypes = function (): string[] {
    return Object.values(COLLATERALS)
        .filter(config => config.isActive)
        .map(config => config.ilk);
};

export default COLLATERALS;
