import { getContractAddressByName, getErc20Contract } from '../../src/contracts';
import BigNumber from '../../src/bignumber';
import { TEST_NETWORK, HARDHAT_PUBLIC_KEY } from '../../helpers/constants';
import { CollateralConfig, CollateralType } from '../../src/types';
import { getCollateralConfigBySymbol, getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import { overwriteUintMappingInAddress, runBalanceSlotDiscoveryLoopForERC20Token } from './slotOverwrite';

export const determineBalanceSlot = async (
    collateralType: CollateralType
): Promise<[string, 'vyper' | 'solidity'] | [null, null]> => {
    const collateralConfig = getCollateralConfigByType(collateralType);
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    try {
        const [slot, languageFormat] = await findERC20BalanceSlot(tokenContractAddress);
        return [slot, languageFormat];
    } catch (e) {
        if (
            e instanceof Error &&
            e.message.startsWith('Failed to find the slot of the balance for the token in address ')
        ) {
            return [null, null];
        }
        throw e;
    }
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

export const setCollateralInWallet = async (
    collateralSymbol: CollateralConfig['symbol'],
    collateralAmount: BigNumber,
    address: string = HARDHAT_PUBLIC_KEY
) => {
    const collateralConfig = getCollateralConfigBySymbol(collateralSymbol);
    const value = collateralAmount.shiftedBy(collateralConfig.decimals);
    const tokenAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const [balanceSlot, languageFormat] = await determineBalanceSlot(collateralConfig.ilk);
    console.info(
        `Balance slot is ${balanceSlot}, language format is ${languageFormat}, contract address is ${tokenAddress}`
    );
    if (!balanceSlot || !languageFormat) {
        throw new Error('Could not overwrite the balance since the balance slot was not found');
    }
    await overwriteUintMappingInAddress(tokenAddress, balanceSlot, address, value, undefined, languageFormat);
};
