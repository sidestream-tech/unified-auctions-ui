export const SETUP_DELAY_MS = 3 * 1000;

if (!process.env.RPC_URL) {
    throw new Error('Required `RPC_URL` env variable was not provided, please refer to the readme');
}
export const RPC_URL = process.env.RPC_URL;
export const SUPPORTED_AUCTION_TYPES = process.env.SUPPORTED_AUCTION_TYPES;
export const WHITELISTED_COLLATERALS = process.env.WHITELISTED_COLLATERALS;

const DEFAULT_REFETCH_INTERVAL_MS = 60 * 1000;
export const REFETCH_INTERVAL_MS = parseInt(process.env.REFETCH_INTERVAL ?? '') || DEFAULT_REFETCH_INTERVAL_MS;

export const KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI = parseInt(
    process.env.KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI || ''
);
export const KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI = parseInt(process.env.KEEPER_SURPLUS_MINIMUM_NET_PROFIT_DAI || '');
export const KEEPER_DEBT_MINIMUM_NET_PROFIT_DAI = parseInt(process.env.KEEPER_DEBT_MINIMUM_NET_PROFIT_DAI || '');
export const KEEPER_WALLET_PRIVATE_KEY = process.env.KEEPER_WALLET_PRIVATE_KEY;
export const KEEPER_PREAUTHORIZE = process.env.KEEPER_PREAUTHORIZE?.toLowerCase().trim() === 'true' || false;

export const THRESHOLD_FOR_NEW_AUCTIONS = 5 * 60 * 1000;
