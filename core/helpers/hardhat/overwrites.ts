import BigNumber from '../../src/bignumber';
import { ethers } from 'ethers';
import { getCollateralConfigByType } from '../../src/constants/COLLATERALS';
import { DAI_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import executeTransaction from '../../src/execute';
import createStructCoder from '../../src/helpers/createStructCoder';
import { getOracleAddressByCollateralType } from '../../src/oracles';
import { overwriteUintValueInAddress } from './slotOverwrite';

export const overwriteCurrentOraclePrice = async (network: string, collateralType: string, amount: BigNumber) => {
    const collateralConfig = getCollateralConfigByType(collateralType);
    const oracleAddress = await getOracleAddressByCollateralType(network, collateralType);
    const amoutInteger = amount.shiftedBy(DAI_NUMBER_OF_DIGITS).toFixed();
    const valueWithValidity = createStructCoder().encode(['uint128', 'uint128'], [amoutInteger, '1']);
    await overwriteUintValueInAddress(
        oracleAddress,
        collateralConfig.oracle.currentPriceSlotAddress,
        valueWithValidity
    );
    await executeTransaction(network, 'MCD_SPOT', 'poke', [ethers.utils.formatBytes32String(collateralType)]);
};
