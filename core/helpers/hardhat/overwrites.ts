import BigNumber from '../../src/bignumber';
import { ethers } from 'ethers';
import { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import { DAI_NUMBER_OF_DIGITS, RAY_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import executeTransaction from '../../src/execute';
import createStructCoder from '../../src/helpers/createStructCoder';
import { getOracleAddressByCollateralType } from '../../src/oracles';
import { overwriteUintMapping, overwriteUintValueInAddress } from './slotOverwrite';
import { getOracleWrapperOsmByAddress } from '../../src/contracts';
import getProvider from '../../src/provider';

const STABILITY_FEE_ACCUMULATION_RATE_SLOT = '0x1';

export const overwriteCurrentOraclePrice = async (network: string, collateralType: string, amount: BigNumber) => {
    const collateralConfig = getCollateralConfigByType(collateralType);
    const oracleOrWrapperAddress = await getOracleAddressByCollateralType(network, collateralType);

    const amountInteger = amount.shiftedBy(DAI_NUMBER_OF_DIGITS).toFixed(0);
    const valueWithValidity = createStructCoder().encode(['uint128', 'uint128'], ['1', amountInteger]);

    let osmAddress;
    let oracleConfig;
    if (collateralConfig.oracle.type === 'CappedWrapper') {
        await overwriteUintValueInAddress(
            oracleOrWrapperAddress,
            collateralConfig.oracle.capSlotAddress,
            valueWithValidity
        );
        osmAddress = await getOracleWrapperOsmByAddress(oracleOrWrapperAddress, await getProvider(network));
        oracleConfig = collateralConfig.oracle.oracle;
    } else {
        osmAddress = oracleOrWrapperAddress;
        oracleConfig = collateralConfig.oracle;
    }

    await overwriteUintValueInAddress(osmAddress, oracleConfig.currentPriceSlotAddress, valueWithValidity);
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
