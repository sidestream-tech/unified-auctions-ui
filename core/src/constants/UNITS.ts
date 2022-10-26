import BigNumber from 'bignumber.js';

export const NULL_BYTES = '0x';
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

// Common Maker Units https://github.com/makerdao/dss/blob/master/DEVELOPING.md#units
// WAD: fixed point decimal with 18 decimals (for basic quantities, e.g. balances)
// RAY: fixed point decimal with 27 decimals (for precise quantites, e.g. ratios)
// RAD: fixed point decimal with 45 decimals (result of integer multiplication with a WAD and a RAY)
export const WAD = new BigNumber('1e18');
export const RAD = new BigNumber('1e45');
export const RAY = new BigNumber('1e27');
export const MAX = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
export const WAD_NUMBER_OF_DIGITS = 18;
export const RAD_NUMBER_OF_DIGITS = 45;
export const RAY_NUMBER_OF_DIGITS = 27;
export const DAI_NUMBER_OF_DIGITS = 18;
export const MKR_NUMBER_OF_DIGITS = 18;
export const ETH_NUMBER_OF_DIGITS = 18;
export const GWEI_NUMBER_OF_DIGITS = 9;
