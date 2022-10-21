import BigNumber from '../../bignumber';
import { getCollateralConfigBySymbol } from '../../constants/COLLATERALS';
import { ETH_NUMBER_OF_DIGITS } from '../../constants/UNITS';
import getContract from '../../contracts';

export const convertWstethToSteth = async function (network: string, collateralAmount: BigNumber) {
    const collateralConfig = getCollateralConfigBySymbol('WSTETH');
    const collateralContract = await getContract(network, collateralConfig.symbol);
    const collateralIntegerAmount = collateralAmount.shiftedBy(collateralConfig.decimals).toFixed(0);
    const stethIntegerAmount = await collateralContract.getStETHByWstETH(collateralIntegerAmount);
    return new BigNumber(stethIntegerAmount._hex).shiftedBy(-ETH_NUMBER_OF_DIGITS);
};
