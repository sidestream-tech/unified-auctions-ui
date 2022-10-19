import { ethers } from 'ethers';
import getContract, { getContractAddressByName, getErc20Contract } from '../../src/contracts';
import BigNumber from '../../src/bignumber';
import { EthereumProvider } from 'hardhat/types';
import { TEST_NETWORK, HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import { DAI_NUMBER_OF_DIGITS, MKR_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import { CollateralConfig, CollateralType } from '../../src/types';
import {
    determineBalanceSlot,
    overwriteUintMapping,
    overwriteUintMappingInAddress,
    overwriteUintTable,
} from '../hardhat/slotOverwrite';
import { runBalanceSlotDiscoveryLoopForERC20Token } from './slotOverwrite';
import { getCollateralConfigBySymbol } from '../../src/constants/COLLATERALS';

export const addDaiToBalance = async (
    daiAmount: BigNumber = new BigNumber(100000),
    walletAddress: string = HARDHAT_PUBLIC_KEY
) => {
    const daiContract = await getContract(TEST_NETWORK, 'MCD_DAI', false);
    await overwriteUintMapping('MCD_DAI', '0x2', walletAddress, daiAmount.shiftedBy(DAI_NUMBER_OF_DIGITS));
    const daiBalanceHex = await daiContract.balanceOf(walletAddress);
    const daiBalance = new BigNumber(daiBalanceHex._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS);
    console.info(`New DAI balance: ${daiBalance}`);
};

export const addMkrToBalance = async (
    mkrAmount: BigNumber = new BigNumber(100000),
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

export const setCollateralInWallet = async (
    collateralSymbol: CollateralConfig['symbol'],
    collateralAmount: BigNumber,
    address: string = HARDHAT_PUBLIC_KEY,
) => {
    const collateralConfig = getCollateralConfigBySymbol(collateralSymbol)
    const value = collateralAmount.shiftedBy(collateralConfig.decimals);
    const tokenAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const [balanceSlot, languageFormat] = await determineBalanceSlot(collateralConfig.ilk);
    if (!balanceSlot || !languageFormat) {
        throw new Error('Could not overwrite the balance since the balance slot was not found');
    }
    await overwriteUintMappingInAddress(
        tokenAddress,
        balanceSlot,
        address,
        value,
        undefined,
        languageFormat
    );
};

export const findERC20BalanceSlot = async (tokenAddress: string): Promise<[string, 'vyper' | 'solidity']> => {
    const contract = await getErc20Contract(TEST_NETWORK, tokenAddress);
    const balanceHex = await contract.balanceOf(HARDHAT_PUBLIC_KEY);
    const balance = new BigNumber(balanceHex._hex);
    const overwriteValue = balance.eq(0) ? new BigNumber(10) : new BigNumber(0);
    const discoverySolidity = await runBalanceSlotDiscoveryLoopForERC20Token(
        tokenAddress,
        contract,
        overwriteValue,
        balance,
        'solidity'
    );
    if (discoverySolidity) {
        return [discoverySolidity, 'solidity'];
    }
    const discoveryVyper = await runBalanceSlotDiscoveryLoopForERC20Token(
        tokenAddress,
        contract,
        overwriteValue,
        balance,
        'vyper'
    );
    if (discoveryVyper) {
        return [discoveryVyper, 'vyper'];
    }

    throw new Error(`Failed to find the slot of the balance for the token in address ${tokenAddress}`);
};
