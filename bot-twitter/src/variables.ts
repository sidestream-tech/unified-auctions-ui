export const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK || 'kovan';
export const KEEPER_MIN_PROFIT_DAI = process.env.KEEPER_MIN_PROFIT_DAI
    ? parseInt(process.env.KEEPER_MIN_PROFIT_DAI)
    : undefined;
