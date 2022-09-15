export const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
export const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
export const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK || 'mainnet';

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
export const SMTP_USERNAME = process.env.SMTP_USERNAME;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
export const SMTP_EMAIL = process.env.SMTP_EMAIL;

export const RECEIVERS = process.env.RECEIVERS;

export const POWERED_BY = process.env.POWERED_BY || 'Unified Auctions Service';
export const POWERED_BY_LINK = process.env.POWERED_BY_LINK || 'https://github.com/sidestream-tech/unified-auctions-ui';
