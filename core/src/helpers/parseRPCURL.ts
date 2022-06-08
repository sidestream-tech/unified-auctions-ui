const INFURA_URL_PROJECT_ID_IDENTIFIER = 'v3/';

export const parseRPCURLForInfuraId = function (rpcUrl: string) {
    if (!rpcUrl.includes('infura.io/v3')) {
        return undefined;
    }
    const stringFirstIndex = rpcUrl.indexOf(INFURA_URL_PROJECT_ID_IDENTIFIER);
    return rpcUrl.substring(stringFirstIndex + INFURA_URL_PROJECT_ID_IDENTIFIER.length) || undefined;
};
