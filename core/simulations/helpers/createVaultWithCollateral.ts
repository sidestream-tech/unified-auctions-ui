import { ethers } from 'ethers';
import BigNumber from '../../src/bignumber';
import { setCollateralInVat } from '../../helpers/hardhat/balance';
import { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import {
    changeVaultContents,
    fetchVault,
    openVault,
    fetchVaultCollateralParameters,
    openVaultWithProxiedContractAndDrawDebt,
} from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import {
    getContractValue,
    getContractAddressByName,
    getErc20Contract,
    getJoinNameByCollateralType,
} from '../../src/contracts';
import {
    depositCollateralToVat,
    fetchERC20TokenBalance,
    fetchCollateralInVat,
    withdrawCollateralFromVat,
} from '../../src/wallet';
import { MAX } from '../../src/constants/UNITS';
import { CollateralConfig, CollateralType } from '../../src/types';
import { roundDownToFirstSignificantDecimal, roundUpToFirstSignificantDecimal } from '../../helpers/hex';
import { determineBalanceSlot, setCollateralInWallet } from '../../helpers/hardhat/erc20';
import { getAllCollateralTypes } from '../../src/constants/COLLATERALS';
import { createProxy } from '../../src/proxy';
import { giveAllowanceToAddress } from '../../src/authorizations';
import detectProxyTarget from '../../helpers/detectProxyTarget';

const UNSUPPORTED_COLLATERAL_TYPES = [
    'UNIV2DAIUSDC-A', // Liquidation limit too high (fails with "Dog/liquidation-limit-hit")
    'WSTETH-B', // Does not accumulate stability fee rate at all
    'RETH-A', // [temporary] this collateral is not yet deployed, tested via different flow
];

export const getLiquidatableCollateralTypes = () => {
    return getAllCollateralTypes().filter(collateralType => !UNSUPPORTED_COLLATERAL_TYPES.includes(collateralType));
};

const setAndCheckCollateralInVat = async (collateralType: CollateralType, collateralOwned: BigNumber) => {
    console.info(`Setting ${collateralType} balance in VAT...`);
    await setCollateralInVat(collateralType, collateralOwned);
    const balance = await fetchCollateralInVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType);
    if (!balance.eq(collateralOwned)) {
        throw new Error(
            `Unexpected vat balance. Expected: ${collateralOwned.toFixed()}, Actual: ${balance.toFixed()}`
        );
    }
    console.info(`New ${collateralType} balance in VAT: ${collateralOwned.toFixed()}`);
    return balance;
};

const checkAndWithdrawCollateralFromVat = async (collateralConfig: CollateralConfig, collateralOwned: BigNumber) => {
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const addressJoin = await getContractAddressByName(
        TEST_NETWORK,
        getJoinNameByCollateralType(collateralConfig.ilk)
    );
    const joinBalance = await fetchERC20TokenBalance(
        TEST_NETWORK,
        tokenContractAddress,
        addressJoin,
        collateralConfig.decimals
    );
    if (joinBalance.lt(collateralOwned)) {
        throw new Error(
            `Join contract ${
                collateralConfig.ilk
            } does not have sufficient funds: ${joinBalance.toFixed()} vs ${collateralOwned.toFixed()}`
        );
    }
    console.info(`Withdrawing collateral ${collateralConfig.ilk} from VAT`);
    await withdrawCollateralFromVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralConfig.ilk, collateralOwned);
};

const ensureWalletBalance = async (collateralConfig: CollateralConfig, collateralOwned: BigNumber) => {
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const balance = await fetchERC20TokenBalance(
        TEST_NETWORK,
        tokenContractAddress,
        HARDHAT_PUBLIC_KEY,
        collateralConfig.decimals
    );
    if (!balance.eq(collateralOwned)) {
        throw new Error(
            `Unexpected wallet balance. Expected ${collateralOwned.toFixed()}, Actual ${balance.toFixed()}`
        );
    }
    console.info(`Wallet has ${collateralOwned.toFixed()} ${collateralConfig.symbol}`);
};

const putCollateralIntoVaultAndWithdrawDai = async (vaultId: number, collateralOwned: BigNumber) => {
    const vault = await fetchVault(TEST_NETWORK, vaultId);
    const drawnDebtExact = collateralOwned.multipliedBy(vault.minUnitPrice).dividedBy(vault.stabilityFeeRate);
    const drawnDebt = roundDownToFirstSignificantDecimal(drawnDebtExact);
    console.info(
        `Vault #${vaultId}: depositing  ${collateralOwned.toFixed(2)} ${
            vault.collateralType
        } in exchange for ${drawnDebt.toFixed()} DAI`
    );
    await changeVaultContents(TEST_NETWORK, vaultId, drawnDebt, collateralOwned);
    const updatedVault = await fetchVault(TEST_NETWORK, vaultId);
    console.info(
        `Vault #${vaultId}: contans ${updatedVault.collateralAmount.toFixed(2)} ${updatedVault.collateralType}, ${
            updatedVault.initialDebtDai
        } DAI of debt`
    );
};

export const calculateMinCollateralAmountToOpenVault = async (collateralType: CollateralType) => {
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    const minDebtDai = await getContractValue(TEST_NETWORK, 'MCD_VAT', 'ilks', {
        parameters: [typeHex],
        variableName: 'dust',
        decimalUnits: 'RAD',
    });
    const { minUnitPrice } = await fetchVaultCollateralParameters(TEST_NETWORK, collateralType);
    const debt = !minDebtDai.isZero() ? minDebtDai : new BigNumber(0.00001);
    const minCollateralInVault = roundUpToFirstSignificantDecimal(debt.div(minUnitPrice)).multipliedBy(1.1);
    await checkAvailableDebtForAmountAndMinUnitPrice(collateralType, minCollateralInVault, minUnitPrice);
    return minCollateralInVault;
};

export const checkAvailableDebtForAmountAndMinUnitPrice = async (
    collateralType: CollateralType,
    collateralAmount: BigNumber,
    minUnitPrice: BigNumber
) => {
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    const maxCollateralDebt = await getContractValue(TEST_NETWORK, 'MCD_VAT', 'ilks', {
        parameters: [typeHex],
        variableName: 'line',
        decimalUnits: 'RAD',
    });
    if (maxCollateralDebt.isZero()) {
        throw new Error(`Collateral ${collateralType} max debt set to zero`);
    }
    const currentCollateralDebt = await getContractValue(TEST_NETWORK, 'MCD_VAT', 'ilks', {
        parameters: [typeHex],
        variableName: 'Art',
        decimalUnits: 'WAD',
    });
    const currentTotalDebt = await getContractValue(TEST_NETWORK, 'MCD_VAT', 'debt', { decimalUnits: 'RAD' });
    const maxTotalDebt = await getContractValue(TEST_NETWORK, 'MCD_VAT', 'Line', { decimalUnits: 'RAD' });
    const availableCollateralDebt = maxCollateralDebt.minus(currentCollateralDebt);
    const availableTotalDebt = maxTotalDebt.minus(currentTotalDebt);

    const potentialDebt = minUnitPrice.multipliedBy(collateralAmount);
    if (availableCollateralDebt.lt(potentialDebt) || availableTotalDebt.lt(potentialDebt)) {
        throw new Error(
            `Cannot borrow DAI with ${collateralType}: \n intended debt: ${potentialDebt} \n available global debt: ${availableTotalDebt} \n available collateral debt: ${availableCollateralDebt}`
        );
    }
};

const giveJoinContractAllowance = async (collateralConfig: CollateralConfig, amount?: BigNumber) => {
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const addressJoin = await getContractAddressByName(
        TEST_NETWORK,
        getJoinNameByCollateralType(collateralConfig.ilk)
    );
    const contract = await getErc20Contract(TEST_NETWORK, tokenContractAddress, true);
    const amountRaw = amount ? amount.shiftedBy(collateralConfig.decimals).toFixed(0) : MAX.toFixed(0);
    await contract.approve(addressJoin, amountRaw);
};

const createProxiedVaultWithCollateral = async (collateralType: CollateralType, collateralOwned: BigNumber) => {
    const { minUnitPrice, stabilityFeeRate } = await fetchVaultCollateralParameters(TEST_NETWORK, collateralType);
    const collateralSymbol = getCollateralConfigByType(collateralType).symbol;
    const drawnDebtExact = collateralOwned.multipliedBy(minUnitPrice).dividedBy(stabilityFeeRate);
    const drawnDebt = roundDownToFirstSignificantDecimal(drawnDebtExact);
    const proxyAddress = await createProxy(TEST_NETWORK, HARDHAT_PUBLIC_KEY);
    await giveAllowanceToAddress(TEST_NETWORK, collateralSymbol, proxyAddress, collateralOwned);
    return await openVaultWithProxiedContractAndDrawDebt(
        TEST_NETWORK,
        proxyAddress,
        collateralType,
        collateralOwned,
        drawnDebt
    );
};

const createDefaultVaultWithCollateral = async (collateralType: CollateralType, collateralOwned: BigNumber) => {
    const collateralConfig = getCollateralConfigByType(collateralType);

    const vaultId = await openVault(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType);
    const vault = await fetchVault(TEST_NETWORK, vaultId);
    await giveJoinContractAllowance(collateralConfig);
    const roundedCollateralOwned = await depositCollateralToVat(
        TEST_NETWORK,
        vault.address,
        vault.collateralType,
        collateralOwned
    );
    await putCollateralIntoVaultAndWithdrawDai(vaultId, roundedCollateralOwned);
    return vaultId;
};

const createVaultWithCollateral = async (collateralType: CollateralType, collateralOwned: BigNumber) => {
    const collateralConfig = getCollateralConfigByType(collateralType);
    const [balanceSlot, languageFormat] = await determineBalanceSlot(collateralType);
    if (balanceSlot && languageFormat) {
        await setCollateralInWallet(collateralConfig.symbol, collateralOwned);
    } else {
        // fallback to setting vat balance and withdrawing it
        await setAndCheckCollateralInVat(collateralType, collateralOwned);
        await checkAndWithdrawCollateralFromVat(collateralConfig, collateralOwned);
    }
    await ensureWalletBalance(collateralConfig, collateralOwned);

    const joinContractAddress = await getContractAddressByName(
        TEST_NETWORK,
        getJoinNameByCollateralType(collateralType)
    );
    const proxyTarget = await detectProxyTarget(TEST_NETWORK, joinContractAddress);
    if (!proxyTarget) {
        return await createDefaultVaultWithCollateral(collateralType, collateralOwned);
    }
    return await createProxiedVaultWithCollateral(collateralType, collateralOwned);
};

export default createVaultWithCollateral;
