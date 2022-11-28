import { getTokenAddressByNetworkAndSymbol } from '../../tokens';
import { Pool } from '../../types';

const getRouteSteps = (route: string[], fees: number[]) => {
    const fullRoute = route[route.length - 1] === 'DAI' ? [...route] : [...route, 'DAI'];
    const routeSteps = [];
    for (let i = 0; i < fullRoute.length - 1; i++) {
        routeSteps.push({tokens: [fullRoute[i], fullRoute[i + 1]], fee: fees[i]});
    }
    return routeSteps;
};

export const routeToPool = async (network: string, routes: string[], uniswapFees?: number[]): Promise<Pool[]> => {
    const fees = uniswapFees || routes.map(() => 3000);
    const routeSteps = getRouteSteps(routes, fees);
    return await Promise.all(
        routeSteps.map(async step => ({
            addresses: await Promise.all(step.tokens.map(symbol => getTokenAddressByNetworkAndSymbol(network, symbol))),
            fee: step.fee,
            routes: step.tokens,
        }))
    );
};
