import { ethers } from 'ethers';
import { createProvider } from './provider';
import { getNetworkConfigByType } from './networks';

const signers: Record<string, Promise<ethers.Signer>> = {};

export const createSigner = async function (network: string, privateKey: string): Promise<ethers.Signer> {
    const provider = await createProvider(network);
    return new ethers.Wallet(privateKey, provider);
};

export function setSigner(network: string, signer: Promise<ethers.Signer>) {
    signers[network] = signer;
}

const getSigner = function (network: string): Promise<ethers.Signer> {
    getNetworkConfigByType(network);
    if (!signers[network]) {
        throw new Error(`No signer has been created for the "${network}" network`);
    }
    return signers[network];
};

export default getSigner;
