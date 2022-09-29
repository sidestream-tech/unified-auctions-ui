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
import { depositCollateralToVat, fetchCollateralInVat, withdrawCollateralFromVat } from '../../src/wallet';
import { MAX } from '../../src/constants/UNITS';
import { CollateralType } from '../../src/types';
import { ethers } from 'ethers';

const getLatestVault = async () => {
    const cdpManager = await getContract(TEST_NETWORK, 'CDP_MANAGER', true);
    const lastHex = await cdpManager.last(HARDHAT_PUBLIC_KEY);
    return new BigNumber(lastHex._hex).toNumber();
};

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
    const token = await getErc20Contract(TEST_NETWORK, tokenContractAddress);
    const balanceHex = await token.balanceOf(HARDHAT_PUBLIC_KEY);
    const balance = new BigNumber(balanceHex._hex).shiftedBy(-decimals);
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
    const drawnDebt = new BigNumber(drawnDebtExact.toPrecision(drawnDebtExact.e || 0 + 1, BigNumber.ROUND_DOWN));
    await changeVaultContents(TEST_NETWORK, vaultId, drawnDebt, collateralOwned);
    const vaultWithContents = await fetchVault(TEST_NETWORK, vaultId);
    console.info(
        `Vault's contents: ${vaultWithContents.collateralAmount.toFixed()} of collateral, ${
            vaultWithContents.initialDebtDai
        } of debt`
    );
};
export const getCollateralAmountInVat = async (collateralType: CollateralType) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    const { dust } = await contract.ilks(typeHex);
    const { minUnitPrice } = await fetchVaultCollateralParameters(TEST_NETWORK, collateralType);
    const minCollateralInVault = new BigNumber(new BigNumber(dust._hex).toFixed(0))
        .shiftedBy(-RAD_NUMBER_OF_DIGITS)
        .div(minUnitPrice);

    await checkAvailableDebtForAmountAndMinUnitPrice(collateralType, minCollateralInVault, minUnitPrice);
    return new BigNumber(minCollateralInVault.multipliedBy(1.1).toFixed(0));
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
    const contract = await getErc20Contract(network, tokenContractAddress);
    const balanceHex = await contract.balanceOf(address);
    const balance = new BigNumber(balanceHex._hex).shiftedBy(-WAD_NUMBER_OF_DIGITS);
    return balanceMin.lt(balance);
};

const createVaultForCollateral = async (
    collateralType: CollateralType,
    collateralOwned: BigNumber,
    decimals: number
) => {
    await setupCollateralInVat(collateralType, collateralOwned);

    console.info('Opening the vault');
    await openVault(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType);

    const collateralConfig = getCollateralConfigByType(collateralType);
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const addressJoin = await getContractAddressByName(TEST_NETWORK, getJoinNameByCollateralType(collateralType));
    await giveMaxAllowance(addressJoin, tokenContractAddress);
    await extractCollateralFromVat(collateralType, collateralOwned, tokenContractAddress);

    await ensureBalance(tokenContractAddress, decimals, collateralOwned);

    const latestVaultId = await getLatestVault();
    const vault = await fetchVault(TEST_NETWORK, latestVaultId);
    await depositCollateralToVat(TEST_NETWORK, vault.address, vault.collateralType, collateralOwned);

    await addCollateralToVault(latestVaultId, collateralOwned);
    return latestVaultId;
};

export default createVaultForCollateral;
