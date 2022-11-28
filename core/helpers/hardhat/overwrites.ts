import BigNumber from '../../src/bignumber';
import { ethers } from 'ethers';
import { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import { DAI_NUMBER_OF_DIGITS, RAY_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import executeTransaction from '../../src/execute';
import createStructCoder from '../../src/helpers/createStructCoder';
import { getOracleAddressByCollateralType } from '../../src/oracles';
import { overwriteUintMapping, overwriteUintValueInAddress } from './slotOverwrite';

const STABILITY_FEE_ACCUMULATION_RATE_SLOT = '0x1';

export const overwriteCurrentOraclePrice = async (network: string, collateralType: string, amount: BigNumber) => {
    const collateralConfig = getCollateralConfigByType(collateralType);
    const oracleAddress = await getOracleAddressByCollateralType(network, collateralType);
    const amoutInteger = amount.shiftedBy(DAI_NUMBER_OF_DIGITS).toFixed(0);
    const valueWithValidity = createStructCoder().encode(['uint128', 'uint128'], ['1', amoutInteger]);
    await overwriteUintValueInAddress(
        oracleAddress,
        collateralConfig.oracle.currentPriceSlotAddress,
        valueWithValidity
    );
    await executeTransaction(network, 'MCD_SPOT', 'poke', [ethers.utils.formatBytes32String(collateralType)]);
};

export const overwriteStabilityFeeAccumulationRate = async (collateralType: string, rate: BigNumber) => {
    await overwriteUintMapping(
        'MCD_JUG',
        STABILITY_FEE_ACCUMULATION_RATE_SLOT,
        ethers.utils.formatBytes32String(collateralType),
        rate.shiftedBy(RAY_NUMBER_OF_DIGITS)
    );
};
