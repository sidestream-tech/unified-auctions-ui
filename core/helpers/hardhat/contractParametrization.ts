import getContract from '../../src/contracts';
import { CollateralType } from '../../src/types';
import { TEST_NETWORK } from '../constants';
import { ethers } from 'ethers';
import { MAX } from '../../src/constants/UNITS';

export const setDebtCeilingToMax = async (collateralType: CollateralType) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_VAT', true);
    const encodedCollateralType = ethers.utils.formatBytes32String(collateralType);
    const encodedTargetVariableCollateralCeiling = ethers.utils.formatBytes32String('line');
    const encodedTargetVariableGlobalCeiling = ethers.utils.formatBytes32String('Line');
    await contract['file(bytes32,bytes32,uint256)'](
        encodedCollateralType,
        encodedTargetVariableCollateralCeiling,
        MAX.toFixed()
    );
    await contract['file(bytes32,uint256)'](encodedTargetVariableGlobalCeiling, MAX.toFixed());
};

export const setLiquidationLimitToMax = async (collateralType: CollateralType) => {
    const contract = await getContract(TEST_NETWORK, 'MCD_DOG', true);
    const encodedCollateralType = ethers.utils.formatBytes32String(collateralType);
    const encodedTargetVariableCollateralCeiling = ethers.utils.formatBytes32String('hole');
    const encodedTargetVariableGlobalCeiling = ethers.utils.formatBytes32String('Hole');
    await contract['file(bytes32,bytes32,uint256)'](
        encodedCollateralType,
        encodedTargetVariableCollateralCeiling,
        MAX.toFixed()
    );
    await contract['file(bytes32,uint256)'](encodedTargetVariableGlobalCeiling, MAX.toFixed());
};
