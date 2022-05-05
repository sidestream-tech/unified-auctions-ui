import { ETHEREUM_NETWORK, ETHERSCAN_API_KEY } from './variables';
import axios from 'axios';
import { NETWORKS } from './constants/NETWORKS';

function getEtherscanURL(network: string) {
    return NETWORKS[network].etherscanURL;
}

function getEtherscanAPI(network: string) {
    return NETWORKS[network].etherscanAPI;
}

export function validateEtherscanAPIKey() {
    if (!ETHERSCAN_API_KEY) {
        throw new Error(``);
    }
}

export async function getAbiFromContractAddress(contract: string) {
    const result = await axios.get(
        `${getEtherscanAPI(
            ETHEREUM_NETWORK
        )}/api?module=contract&action=getabi&address=${contract}&apikey=${ETHERSCAN_API_KEY}`
    );
    return JSON.parse(result.data.result);
}

export function formatEtherscanLink(network: string, type: string, content: string) {
    return `${getEtherscanURL(network)}/${type}/${content}`;
}
