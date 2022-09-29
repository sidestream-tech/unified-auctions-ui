import { setCollateralInVat } from '../../helpers/hardhat';
import { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import BigNumber from '../../src/bignumber';
import { changeVaultContents, fetchVault, openVault, fetchVaultCollateralParameters } from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import { RAD_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import getContract, {
    getContractAddressByName,
    getErc20Contract,
    getJoinNameByCollateralType,
} from '../../src/contracts';
import {
    depositCollateralToVat,
    fetchCollateralInVat,
    fetchERC20TokenBalance,
    withdrawCollateralFromVat,
} from '../../src/wallet';
import { MAX } from '../../src/constants/UNITS';
import { CollateralType } from '../../src/types';
import { ethers } from 'ethers';
import { roundUpToFirstSignificantDecimal } from '../../helpers/hex';

const setupCollateralInVat = async (collateralType: CollateralType, collateralOwned: BigNumber) => {
    console.info('Setting collateral in VAT...');
    await setCollateralInVat(collateralType, collateralOwned);
    const balance = await fetchCollateralInVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType);
    if (!balance.eq(collateralOwned)) {
        throw new Error(
            `Unexpected vat balance. Expected: ${collateralOwned.toFixed()}, Actual: ${balance.toFixed()}`
        );
    }
    console.info(`Vat Collateral ${collateralType} balance of ${HARDHAT_PUBLIC_KEY} is ${collateralOwned.toFixed()}`);
    return balance;
};

const giveMaxAllowance = async (addressJoin: string, tokenContractAddress: string) => {
    const contract = await getErc20Contract(TEST_NETWORK, tokenContractAddress, true);
    await contract.approve(addressJoin, MAX.toFixed(0));
    console.info('Max allowance given out');
};

const extractCollateralFromVat = async (
    collateralType: CollateralType,
    collateralOwned: BigNumber,
    tokenContractAddress: string
) => {
    console.info('Extracting collateral');
    const addressJoin = await getContractAddressByName(TEST_NETWORK, getJoinNameByCollateralType(collateralType));
    const joinContractHasSufficientFunds = await isBalanceGreaterThan(
        TEST_NETWORK,
        tokenContractAddress,
        addressJoin,
        collateralOwned
    );
    if (!joinContractHasSufficientFunds) {
        throw new Error('Join contract does not have sufficient funds');
    }
    await withdrawCollateralFromVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType, undefined);
    return tokenContractAddress;
};

const ensureBalance = async (tokenContractAddress: string, decimals: number, collateralOwned: BigNumber) => {
    const balance = await fetchERC20TokenBalance(TEST_NETWORK, tokenContractAddress, HARDHAT_PUBLIC_KEY, decimals);
    if (!balance.eq(collateralOwned)) {
        throw new Error(
            `Unexpected wallet balance. Expected ${collateralOwned.toFixed()}, Actual ${balance.toFixed()}`
        );
    }
    console.info(`Wallet ${HARDHAT_PUBLIC_KEY} has ${collateralOwned.toFixed()} of token ${tokenContractAddress}`);
};

const addCollateralToVault = async (vaultId: number, collateralOwned: BigNumber) => {
    console.info('Adding collateral to Vault');
    const vault = await fetchVault(TEST_NETWORK, vaultId);
    const drawnDebtExact = collateralOwned.multipliedBy(vault.minUnitPrice).dividedBy(vault.stabilityFeeRate);
    const drawnDebt = new BigNumber(drawnDebtExact.toFixed(0, BigNumber.ROUND_DOWN));
    console.info(`Drawing ${drawnDebt.toFixed()} of dai`);
    await changeVaultContents(TEST_NETWORK, vaultId, drawnDebt, collateralOwned);
    const vaultWithContents = await fetchVault(TEST_NETWORK, vaultId);
    console.info(
        `Vault's contents: ${vaultWithContents.collateralAmount.toFixed()} of collateral, ${
            vaultWithContents.initialDebtDai
        } of debt`
    );
};

export const minimumAmountOfCollateralToOpenVault = async (collateralType: CollateralType) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    const { dust } = await contract.ilks(typeHex);
    const { minUnitPrice } = await fetchVaultCollateralParameters(TEST_NETWORK, collateralType);
    const minDebtDai = new BigNumber(dust._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS)
    const debt = !minDebtDai.isZero() ? minDebtDai : new BigNumber(1)
    const minCollateralInVault = roundUpToFirstSignificantDecimal(
        debt.div(minUnitPrice)
    ).multipliedBy(1.1);

    await checkAvailableDebtForAmountAndMinUnitPrice(collateralType, minCollateralInVault, minUnitPrice);
    return minCollateralInVault;
};

export const checkAvailableDebtForAmountAndMinUnitPrice = async (
    collateralType: CollateralType,
    collateralAmount: BigNumber,
    minUnitPrice: BigNumber
) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(collateralType);

    const { line, Art } = await contract.ilks(typeHex);
    const debtHex = await contract.debt();
    const overallDebtHex = await contract.Line();

    const maxCollateralDebt = new BigNumber(line._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const currentCollateralDebt = new BigNumber(Art._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const overallDebt = new BigNumber(overallDebtHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const debt = new BigNumber(debtHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const potentialDebt = minUnitPrice.multipliedBy(collateralAmount);

    if (
        minUnitPrice.isZero() ||
        maxCollateralDebt.minus(currentCollateralDebt).lt(potentialDebt) ||
        overallDebt.minus(debt).lt(potentialDebt)
    ) {
        throw new Error(`Cannot borrow more dai with the collateral ${collateralType}`);
    }
};

const isBalanceGreaterThan = async (
    network: string,
    tokenContractAddress: string,
    address: string,
    balanceMin: BigNumber
) => {
    const balance = await fetchERC20TokenBalance(network, tokenContractAddress, address, WAD_NUMBER_OF_DIGITS);
    return balanceMin.lt(balance);
};

const createVaultForCollateral = async (collateralType: CollateralType, collateralOwned: BigNumber) => {
    const decimals = getCollateralConfigByType(collateralType).decimals;
    await setupCollateralInVat(collateralType, collateralOwned);

    const latestVaultId = await openVault(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType);

    const collateralConfig = getCollateralConfigByType(collateralType);
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const addressJoin = await getContractAddressByName(TEST_NETWORK, getJoinNameByCollateralType(collateralType));
    await giveMaxAllowance(addressJoin, tokenContractAddress);
    await extractCollateralFromVat(collateralType, collateralOwned, tokenContractAddress);

    await ensureBalance(tokenContractAddress, decimals, collateralOwned);

    const vault = await fetchVault(TEST_NETWORK, latestVaultId);
    await depositCollateralToVat(TEST_NETWORK, vault.address, vault.collateralType, collateralOwned);

    await addCollateralToVault(latestVaultId, collateralOwned);
    return latestVaultId;
};

export default createVaultForCollateral;
