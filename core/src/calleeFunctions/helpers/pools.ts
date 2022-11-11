import { getTokenAddressByNetworkAndSymbol } from '../../tokens';
import { Pool } from '../../types';

const getRouteSteps = (route: string[]) => {
    const routeSteps = [];
    for (let i = 0; i < route.length - 1; i++) {
        routeSteps.push([route[i], route[i + 1]]);
    }
    return routeSteps;
};

export const routeToPool = async (network: string, route: string[], fee: number): Promise<Pool[]> => {
    const routeSteps = getRouteSteps(route);
    return await Promise.all(
        routeSteps.map(async step => ({
            addresses: await Promise.all(step.map(symbol => getTokenAddressByNetworkAndSymbol(network, symbol))),
            fee,
        }))
    );
};
