import { getTokenAddressByNetworkAndSymbol } from '../../tokens';
import { CollateralSymbol, Pool } from '../../types';

const getRouteSteps = (route: string[], fees: number[]) => {
    const routeSteps = [];
    for (let i = 0; i < route.length - 1; i++) {
        routeSteps.push({ tokens: [route[i], route[i + 1]], fee: fees[i] });
    }
    return routeSteps;
};

export const routeToPool = async (
    network: string,
    route: string[],
    collateralSymbol: CollateralSymbol,
    uniswapFees?: number[]
): Promise<Pool[]> => {
    const fees = uniswapFees || Array.from({ length: route.length + 2 }, () => 3000);
    collateralSymbol;
    const routeSteps = getRouteSteps(route, fees);
    return await Promise.all(
        routeSteps.map(async step => ({
            addresses: await Promise.all(
                step.tokens.map(symbol => getTokenAddressByNetworkAndSymbol(network, symbol))
            ),
            fee: step.fee,
            routes: step.tokens,
        }))
    );
};
