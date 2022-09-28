import BigNumber from '../src/bignumber';
import getContract, { getErc20Contract } from '../src/contracts';
import { CollateralType } from '../src/types';
import { featchAllowanceAmount } from '../src/authorizations';
import { fetchCollateralInVat } from '../src/wallet';

export const assertVatCollateralBalance = async (
    network: string,
    walletAddress: string,
    collateralType: CollateralType,
    expectedBalance: BigNumber,
    decimals: number
) => {
    const balance = await fetchCollateralInVat(network, walletAddress, collateralType, decimals);
    if (!balance.eq(expectedBalance)) {
        throw new Error(
            `Unexpected vat balance. Expected: ${expectedBalance.toFixed()}, Actual: ${balance.toFixed()}`
        );
    }
    console.info(`Vat Collateral ${collateralType} balance of ${walletAddress} is ${expectedBalance.toFixed()} WAD`);
};

export const assertAllowance = async (
    network: string,
    walletAddress: string,
    authenticatedAddress: string,
    erc20TokenAddress: string,
    expectedAllowance: BigNumber,
    decimals: number
) => {
    const allowance = await featchAllowanceAmount(
        network,
        erc20TokenAddress,
        authenticatedAddress,
        walletAddress,
        decimals
    );
    if (allowance.toFixed(0) !== expectedAllowance.toFixed(0)) {
        throw new Error(
            `Unexpected allowance: Expected ${expectedAllowance.toFixed()}, actual: ${allowance.toFixed()}`
        );
    }
    console.info(`Allowance of ${authenticatedAddress} from ${walletAddress} is ${expectedAllowance.toFixed()} WAD`);
};

export const assertAuth = async (network: string, accessorAddress: string, accessedAddress: string) => {
    const vat = await getContract(network, 'MCD_VAT');
    const authHex = await vat.can(accessedAddress, accessorAddress);
    const auth = new BigNumber(authHex._hex);
    if (!auth.eq(1)) {
        throw new Error('Unexpected auth');
    }
    console.info(`Wallet ${accessorAddress} has access to ${accessedAddress}`);
};

export const assertBalance = async (
    network: string,
    erc20TokenAddress: string,
    walletAddress: string,
    expectedBalance: BigNumber,
    decimals: number
) => {
    const token = await getErc20Contract(network, erc20TokenAddress);
    const balanceHex = await token.balanceOf(walletAddress);
    const balance = new BigNumber(balanceHex._hex).shiftedBy(-decimals);
    if (!balance.eq(expectedBalance)) {
        throw new Error(
            `Unexpected wallet balance. Expected ${expectedBalance.toFixed()}, Actual ${balance.toFixed()}`
        );
    }
    console.info(`Wallet ${walletAddress} has ${expectedBalance.toFixed()} of token ${erc20TokenAddress}`);
};
