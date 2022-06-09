const INFURA_URL_PROJECT_ID_IDENTIFIER = 'v3/';
const INFURA_NETWORK_IDENTIFIER_START = 'https://';
const INFURA_NETWORK_IDENTIFIER_END = '.infura.io';

export const parseRPCURLForInfuraParameters = function (rpcUrl: string): {
    projectId?: string;
    defaultNetwork?: string;
} {
    if (!rpcUrl.includes('infura.io/v3')) {
        return {
            projectId: undefined,
            defaultNetwork: undefined,
        };
    }

    const projectIdFirstIndex = rpcUrl.indexOf(INFURA_URL_PROJECT_ID_IDENTIFIER);
    const projectId = rpcUrl.substring(projectIdFirstIndex + INFURA_URL_PROJECT_ID_IDENTIFIER.length).replace('/', '');

    const networkFirstIndex = rpcUrl.indexOf(INFURA_NETWORK_IDENTIFIER_START);
    const networkLastIndex = rpcUrl.indexOf(INFURA_NETWORK_IDENTIFIER_END);

    const defaultNetwork = rpcUrl.substring(
        networkFirstIndex + INFURA_NETWORK_IDENTIFIER_START.length,
        networkLastIndex
    );

    return {
        projectId,
        defaultNetwork,
    };
};
