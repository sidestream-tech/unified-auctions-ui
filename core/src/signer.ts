import { ethers } from 'ethers';
import NETWORKS from './constants/NETWORKS';
import getProvider from './provider';

const signers: Record<string, ethers.Wallet> = {};

const getSigner = function (network: string): ethers.Wallet {
    if (!NETWORKS[network]) {
        throw new Error(`The network "${network}" is not supported yet!`);
    }

    if (!signers[network]) {
        throw new Error(`No signer has been authorized for this network!`);
    }
    return signers[network];
};

export function setSigner(network: string, signer: ethers.Wallet) {
    signers[network] = signer;
}

export const createSigner = async function (network: string, privateKey: string) {
    const provider = getProvider(network);

    try {
        const signer = new ethers.Wallet(privateKey, provider);
        setSigner(network, signer as any);
        const address = await signers[network].getAddress();
        console.info(`Using wallet "${address}"`);
    } catch (error) {
        throw error;
    }
};

export default getSigner;
