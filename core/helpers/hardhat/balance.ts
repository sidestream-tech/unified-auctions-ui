import { ethers } from 'ethers';
import getContract from '../../src/contracts';
import BigNumber from '../../src/bignumber';
import { EthereumProvider } from 'hardhat/types';
import { TEST_NETWORK, HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import { DAI_NUMBER_OF_DIGITS, MKR_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import { CollateralType } from '../../src/types';
import { overwriteUintMapping, overwriteUintTable } from '../hardhat/slotOverwrite';

export const addDaiToBalance = async (
    daiAmount: BigNumber = new BigNumber(10 ** 6),
    walletAddress: string = HARDHAT_PUBLIC_KEY
) => {
    const daiContract = await getContract(TEST_NETWORK, 'MCD_DAI', false);
    await overwriteUintMapping('MCD_DAI', '0x2', walletAddress, daiAmount.shiftedBy(DAI_NUMBER_OF_DIGITS));
    const daiBalanceHex = await daiContract.balanceOf(walletAddress);
    const daiBalance = new BigNumber(daiBalanceHex._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
    console.info(`New DAI balance: ${daiBalance}`);
};

export const addMkrToBalance = async (
    mkrAmount: BigNumber = new BigNumber(10 ** 6),
    walletAddress: string = HARDHAT_PUBLIC_KEY
) => {
    const mkrContract = await getContract(TEST_NETWORK, 'MCD_GOV', false);
    await overwriteUintMapping('MCD_GOV', '0x1', walletAddress, mkrAmount.shiftedBy(MKR_NUMBER_OF_DIGITS));
    const mkrBalanceHex = await mkrContract.balanceOf(walletAddress);
    const mkrBalance = new BigNumber(mkrBalanceHex._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
    console.info(`New MKR balance: ${mkrBalance}`);
};

export const setCollateralInVat = async (
    collateralType: CollateralType,
    collateralAmount: BigNumber,
    provider?: EthereumProvider
) => {
    const value = collateralAmount.shiftedBy(WAD_NUMBER_OF_DIGITS);
    const collateralTypeHex = ethers.utils.formatBytes32String(collateralType);
    await overwriteUintTable('MCD_VAT', '0x4', collateralTypeHex, HARDHAT_PUBLIC_KEY, value, provider);
};
