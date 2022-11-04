import getContract, { getClipperNameByCollateralType } from '../../src/contracts';
import { CollateralType } from '../../src/types';
import { TEST_NETWORK } from '../constants';
import { ethers } from 'ethers';
import BigNumber from '../../src/bignumber';

export const setCollateralDebtCeilingToGlobal = async (collateralType: CollateralType) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VAT', true);
    const encodedCollateralType = ethers.utils.formatBytes32String(collateralType);
    const encodedTargetVariableCollateralCeiling = ethers.utils.formatBytes32String('line');
    const value = new BigNumber((await contract.Line())._hex);
    await contract['file(bytes32,bytes32,uint256)'](
        encodedCollateralType,
        encodedTargetVariableCollateralCeiling,
        value.toFixed(0)
    );
};

export const setCollateralLiquidationLimitToGlobal = async (collateralType: CollateralType) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_DOG', true);
    const encodedCollateralType = ethers.utils.formatBytes32String(collateralType);
    const encodedTargetVariableCollateralCeiling = ethers.utils.formatBytes32String('hole');
    const value = new BigNumber((await contract.Hole())._hex);
    await contract['file(bytes32,bytes32,uint256)'](
        encodedCollateralType,
        encodedTargetVariableCollateralCeiling,
        value.toFixed(0)
    );
};

export const allowAllActionsInClipperContract = async (collateralType: CollateralType) => {
    const clipper = getClipperNameByCollateralType(collateralType);
    const contract = await getContract(TEST_NETWORK, clipper, true);
    const encodedTargetVariable = ethers.utils.formatBytes32String('stopped');
    await contract['file(bytes32,uint256)'](encodedTargetVariable, '0x0');
};
