import { setCollateralInVat } from '../../helpers/hardhat';
import { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import BigNumber from '../../src/bignumber';
import { changeVaultContents, fetchVault, openVault } from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import getContract, {
    getContractAddressByName,
    getErc20Contract,
    getJoinNameByCollateralType,
} from '../../src/contracts';
import { depositCollateralToVat, fetchCollateralInVat, withdrawCollateralFromVat } from '../../src/wallet';
import { MAX } from '../../src/constants/UNITS';
import { CollateralType } from '../../src/types';

const getLatestVault = async () => {
    const cdpManager = await getContract(TEST_NETWORK, 'CDP_MANAGER', true);
    const lastHex = await cdpManager.last(HARDHAT_PUBLIC_KEY);
    return new BigNumber(lastHex._hex).toNumber();
};

const createVaultForCollateral = async (
    collateralType: CollateralType,
    collateralOwned: BigNumber,
    decimals: number
) => {
    console.info('Setting collateral in VAT...');
    await setCollateralInVat(collateralType, collateralOwned);
    let balance = await fetchCollateralInVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType, decimals);
    if (!balance.eq(collateralOwned)) {
        throw new Error(
            `Unexpected vat balance. Expected: ${collateralOwned.toFixed()}, Actual: ${balance.toFixed()}`
        );
    }
    console.info(`Vat Collateral ${collateralType} balance of ${HARDHAT_PUBLIC_KEY} is ${collateralOwned.toFixed()}`);
    console.info('Opening the vault');
    await openVault(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType);
    console.info('Extracting collateral');
    const addressJoin = await getContractAddressByName(TEST_NETWORK, getJoinNameByCollateralType(collateralType));
    const collateralConfig = getCollateralConfigByType(collateralType);
    const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
    const contract = await getErc20Contract(TEST_NETWORK, tokenContractAddress, true);
    await contract.approve(addressJoin, MAX.toFixed(0));
    console.info('Max allowance given out');
    await withdrawCollateralFromVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType, undefined);
    const token = await getErc20Contract(TEST_NETWORK, tokenContractAddress);
    const balanceHex = await token.balanceOf(HARDHAT_PUBLIC_KEY);
    balance = new BigNumber(balanceHex._hex).shiftedBy(-decimals);
    if (!balance.eq(collateralOwned)) {
        throw new Error(
            `Unexpected wallet balance. Expected ${collateralOwned.toFixed()}, Actual ${balance.toFixed()}`
        );
    }
    console.info(`Wallet ${HARDHAT_PUBLIC_KEY} has ${collateralOwned.toFixed()} of token ${tokenContractAddress}`);
    console.info('Depositing Collateral to vault');
    const latestVaultId = await getLatestVault();
    let vault = await fetchVault(TEST_NETWORK, latestVaultId);
    await depositCollateralToVat(TEST_NETWORK, vault.address, vault.collateralType, collateralOwned);
    console.info('Adding collateral to Vault');
    vault = await fetchVault(TEST_NETWORK, latestVaultId);
    const drawnDebtExact = collateralOwned.multipliedBy(vault.minUnitPrice).dividedBy(vault.stabilityFeeRate);
    const drawnDebt = new BigNumber(drawnDebtExact.toPrecision(drawnDebtExact.e || 0 + 1, BigNumber.ROUND_DOWN));
    console.info(drawnDebt.toFixed(), vault.minUnitPrice.toFixed(), drawnDebtExact.toFixed());
    await changeVaultContents(TEST_NETWORK, latestVaultId, drawnDebt, collateralOwned);
    const vaultWithContents = await fetchVault(TEST_NETWORK, latestVaultId);
    console.info(
        `Vault's contents: ${vaultWithContents.collateralAmount.toFixed()} of collateral, ${
            vaultWithContents.initialDebtDai
        } of debt`
    );
    return latestVaultId;
};

export default createVaultForCollateral;
