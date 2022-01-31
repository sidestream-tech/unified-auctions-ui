import { ethers } from 'ethers';
import NETWORKS from './constants/NETWORKS';
import getProvider from './provider';

const signers: Record<string, ethers.Wallet> = {};

const getSigner = function (network: string): ethers.Wallet | undefined {
    if (!NETWORKS[network]) {
        throw new Error(`The network "${network}" is not supported yet!`);
    }

    if (!signers[network]) {
        return undefined;
    }
    return signers[network];
};

export const setSigner = async function (network: string, privateKey: string) {
    const provider = getProvider(network);
    signers[network] = new ethers.Wallet(privateKey, provider);

    const address = await signers[network].getAddress();
    console.info(`Authenticated with wallet "${address}"`);
};

export default getSigner;
