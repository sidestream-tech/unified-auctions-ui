export const RPC_URL = process.env.RPC_URL;
export const KEEPER_MINIMUM_NET_PROFIT_DAI_COLLATERAL = parseInt(
    process.env.KEEPER_MINIMUM_NET_PROFIT_DAI_COLLATERAL || ''
);
export const KEEPER_MINIMUM_NET_PROFIT_DAI_SURPLUS = parseInt(process.env.KEEPER_MINIMUM_NET_PROFIT_DAI_SURPLUS || '');
export const KEEPER_WALLET_PRIVATE_KEY = process.env.KEEPER_WALLET_PRIVATE_KEY;
export const WHITELISTED_COLLATERALS = process.env.WHITELISTED_COLLATERALS;
export const KEEPER_PREAUTHORIZE = process.env.KEEPER_PREAUTHORIZE?.toLowerCase().trim() === 'true' || false;
