import { warpTime, resetNetworkAndSetupWallet, setCollateralInVat } from '../../helpers/hardhat';
import { Simulation } from '../types';
import prompts from 'prompts';
import COLLATERALS, { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import BigNumber from 'bignumber.js';
import memoizee from 'memoizee';
import {
    changeVaultContents,
    collectStabilityFees,
    fetchVault,
    openVault,
    liquidateVault,
    fetchVaultBase,
} from '../../src/vaults';
import { HARDHAT_PUBLIC_KEY, TEST_NETWORK } from '../../helpers/constants';
import getContract, {
    getContractAddressByName,
    getErc20Contract,
    getJoinNameByCollateralType,
} from '../../src/contracts';
import { depositCollateralToVat, withdrawCollateralFromVat } from '../../src/wallet';
import { WAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';

const COLLATARAL_OWNED = new BigNumber(2000).shiftedBy(WAD_NUMBER_OF_DIGITS);

const _getCollateralType = async () => {
    const { collateralType } = await prompts([
        {
            type: 'select',
            name: 'collateralType',
            message: 'Select the collateral symbol to add to the VAT.',
            choices: Object.keys(COLLATERALS)
                .sort()
                .map(collateral => ({
                    title: collateral,
                    value: collateral,
                })),
        },
    ]);
    return collateralType;
};

const getCollateralType = memoizee(_getCollateralType, {
    promise: true,
});

const _getLatestVault = async () => {
    const cdpManager = await getContract(TEST_NETWORK, 'CDP_MANAGER', true);
    const lastHex = await cdpManager.last(HARDHAT_PUBLIC_KEY);
    return new BigNumber(lastHex._hex).toNumber();
};

const getLatestVaultIndex = memoizee(_getLatestVault, { promise: true });

const simulation: Simulation = {
    title: 'Simulate liquidation Auctions',
    steps: [
        {
            title: 'Reset blockchain fork',
            // Few blocks before WSTETH-A is taken at 14052147,
            // https://etherscan.io/address/0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457at
            entry: async () => {
                await resetNetworkAndSetupWallet(14052140);
            },
        },
        {
            title: 'Set collateral in VAT',
            entry: async () => {
                const collateralType = await getCollateralType();
                await setCollateralInVat(collateralType, COLLATARAL_OWNED);
            },
        },
        {
            title: 'Open the vault',
            entry: async () => {
                const collateralType = await getCollateralType();
                await openVault(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType);
            },
        },
        {
            title: 'Extract collateral',
            entry: async () => {
                const collateralType = await getCollateralType();
                const addressJoin = await getContractAddressByName(
                    TEST_NETWORK,
                    getJoinNameByCollateralType(collateralType)
                );
                const collateralConfig = getCollateralConfigByType(collateralType);
                const tokenContractAddress = await getContractAddressByName(TEST_NETWORK, collateralConfig.symbol);
                const contract = await getErc20Contract(TEST_NETWORK, tokenContractAddress, true);
                await contract.approve(addressJoin, COLLATARAL_OWNED.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0));
                await withdrawCollateralFromVat(TEST_NETWORK, HARDHAT_PUBLIC_KEY, collateralType, undefined);
            },
        },
        {
            title: 'Deposit Collateral to vault',
            entry: async () => {
                const latestVaultId = await getLatestVaultIndex();
                const vault = await fetchVaultBase(TEST_NETWORK, latestVaultId);
                await depositCollateralToVat(
                    TEST_NETWORK,
                    vault.address,
                    vault.collateralType,
                    COLLATARAL_OWNED.dividedBy(1.2)
                );
            },
        },
        {
            title: 'Add collateral to Vault',
            entry: async () => {
                const latestVaultId = await getLatestVaultIndex();
                await changeVaultContents(TEST_NETWORK, latestVaultId, new BigNumber(0), COLLATARAL_OWNED);
            },
        },
        {
            title: 'Skip time',
            entry: async () => await warpTime(),
        },
        {
            title: 'Collect stability fees',
            entry: async () => {
                const collateralType = await getCollateralType();
                collectStabilityFees(TEST_NETWORK, collateralType);
            },
        },
        {
            title: 'Bark',
            entry: async () => {
                const liquidatedId = await getLatestVaultIndex();
                const vault = await fetchVault(TEST_NETWORK, liquidatedId);
                await liquidateVault(TEST_NETWORK, vault.collateralType, vault.address);
            },
        },
    ],
};

export default simulation;
