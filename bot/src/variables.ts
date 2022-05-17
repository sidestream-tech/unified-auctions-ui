export const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK || 'kovan';
export const KEEPER_MINIMUM_NET_PROFIT_DAI = parseInt(process.env.KEEPER_MINIMUM_NET_PROFIT_DAI || '');
export const KEEPER_WALLET_PRIVATE_KEY = process.env.KEEPER_WALLET_PRIVATE_KEY;
export const WHITELISTED_COLLATERALS = process.env.WHITELISTED_COLLATERALS;
export const KEEPER_PREAUTHORIZE: boolean = process.env.KEEPER_PREAUTHORIZE?.toLowerCase() === 'true' || false;
