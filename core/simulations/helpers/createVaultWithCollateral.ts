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
    collectStabilityFees,
} from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import getContract, {
    getContractValue,
    getContractAddressByName,
    getErc20Contract,
    getJoinNameByCollateralType,
    getClipperNameByCollateralType,
} from '../../src/contracts';
import {
    depositCollateralToVat,
    fetchERC20TokenBalance,
    fetchCollateralInVat,
    withdrawCollateralFromVat,
} from '../../src/wallet';
import { MAX, WAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import { CollateralConfig, CollateralType } from '../../src/types';
import { roundDownToFirstSignificantDecimal, roundUpToFirstSignificantDecimal } from '../../helpers/hex';
import { determineBalanceSlot, setCollateralInWallet } from '../../helpers/hardhat/erc20';
import { getAllCollateralTypes } from '../../src/constants/COLLATERALS';
import { grantAdminPrivelegeForContract } from '../../helpers/hardhat/slotOverwrite';
import {
    allowAllActionsInClipperContract,
    setCollateralDebtCeilingToGlobal,
    setCollateralLiquidationLimitToGlobal,
} from '../../helpers/hardhat/contractParametrization';
import { overwriteStabilityFeeAccumulationRate } from '../../helpers/hardhat/overwrites';
import detectProxyTarget from '../../helpers/detectProxyTarget';
import getSigner from '../../src/signer';

const UNSUPPORTED_COLLATERAL_TYPES = [
    'GNO-A',
    'GUSD-A',
    'USDC-A',
    'USDC-B',
    'RENBTC-A',
    'RETH-A', // [temporary] this collateral is not yet deployed, tested via different flow
    'TUSD-A', // [proxy] this collateral has a proxy-token contract and fallback solution does not work since JOIN contract does not have sufficient funds
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
    const joinName = getJoinNameByCollateralType(collateralConfig.ilk);
    if (!joinName) {
        throw new Error('checkAndWithdrawCollateralFromVat: there is no vat collateral for joinless collateral');
    }
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const addressJoin = await getContractAddressByName(TEST_NETWORK, joinName);
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
    if (balance.minus(collateralOwned).shiftedBy(collateralConfig.decimals).abs().toFixed(0) !== '0') {
        throw new Error(
            `Unexpected wallet balance. Expected ${collateralOwned.toFixed()}, Actual ${balance.toFixed()}`
        );
    }
    console.info(`Wallet has ${collateralOwned.toFixed()} ${collateralConfig.tokenName}`);
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
    const joinName = getJoinNameByCollateralType(collateralConfig.ilk);
    if (!joinName) {
        throw new Error('giveJoinContractAllowance: joinless contract allowance can not be given');
    }
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const addressJoin = await getContractAddressByName(TEST_NETWORK, joinName);
    const contract = await getErc20Contract(TEST_NETWORK, tokenContractAddress, true);
    const amountRaw = amount ? amount.shiftedBy(collateralConfig.decimals).toFixed(0) : MAX.toFixed(0);
    await contract.approve(addressJoin, amountRaw);
};

const createProxiedVaultWithCollateral = async (collateralType: CollateralType, collateralOwned: BigNumber) => {
    const { minUnitPrice, stabilityFeeRate } = await fetchVaultCollateralParameters(TEST_NETWORK, collateralType);
    const drawnDebtExact = collateralOwned.multipliedBy(minUnitPrice).dividedBy(stabilityFeeRate);
    const drawnDebt = roundDownToFirstSignificantDecimal(drawnDebtExact);
    return await openVaultWithProxiedContractAndDrawDebt(TEST_NETWORK, collateralType, collateralOwned, drawnDebt);
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
    return { vaultIndex: vaultId, vaultAddress: vault.address };
};

const createLockstakeVaultWithCollateral = async (collateralType: CollateralType, collateralOwned: BigNumber) => {
    const collateralConfig = getCollateralConfigByType(collateralType);
    const walletAddress = await (await getSigner(TEST_NETWORK)).getAddress();
    const refId = 0;

    // Open engine vault
    const engine = await getContract(TEST_NETWORK, 'LOCKSTAKE_ENGINE', true);
    const vaultIndex = parseInt(await engine.ownerUrnsCount(walletAddress));
    await engine.open(vaultIndex);

    // Lock
    const collateralOwnedInt = collateralOwned.shiftedBy(collateralConfig.decimals).toFixed(0);
    const mkr = await getContract(TEST_NETWORK, 'MCD_GOV', true);
    await mkr['approve(address,uint256)'](engine.address, collateralOwnedInt);
    await engine.lock(walletAddress, vaultIndex, collateralOwnedInt, refId);

    // Draw
    await collectStabilityFees(TEST_NETWORK, collateralType);
    const { minUnitPrice, stabilityFeeRate } = await fetchVaultCollateralParameters(TEST_NETWORK, collateralType);
    const drawnDebtExact = collateralOwned.multipliedBy(minUnitPrice).dividedBy(stabilityFeeRate);
    const drawnDebt = roundDownToFirstSignificantDecimal(drawnDebtExact);
    const drawnDebtInt = drawnDebt.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0);
    await engine.draw(walletAddress, vaultIndex, walletAddress, drawnDebtInt);

    // Get vault address
    const vaultAddress = await engine.ownerUrns(walletAddress, vaultIndex);

    return { vaultIndex, vaultAddress };
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

    const joinName = getJoinNameByCollateralType(collateralType);
    if (!joinName) {
        return await createLockstakeVaultWithCollateral(collateralType, collateralOwned);
    }
    const joinContractAddress = await getContractAddressByName(TEST_NETWORK, joinName);
    const proxyTarget = await detectProxyTarget(TEST_NETWORK, joinContractAddress);
    if (!proxyTarget) {
        return await createDefaultVaultWithCollateral(collateralType, collateralOwned);
    }
    return await createProxiedVaultWithCollateral(collateralType, collateralOwned);
};

export const adjustLimitsAndRates = async (collateralType: CollateralType) => {
    await grantAdminPrivelegeForContract('MCD_VAT');
    await grantAdminPrivelegeForContract('MCD_DOG');
    const clipper = getClipperNameByCollateralType(collateralType);
    await grantAdminPrivelegeForContract(clipper);

    await setCollateralLiquidationLimitToGlobal(collateralType);
    await setCollateralDebtCeilingToGlobal(collateralType);
    await allowAllActionsInClipperContract(collateralType);
    await overwriteStabilityFeeAccumulationRate(collateralType, new BigNumber(1.0000000005));
};

export default createVaultWithCollateral;
