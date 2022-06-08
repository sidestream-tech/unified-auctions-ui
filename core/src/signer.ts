import { ethers } from 'ethers';
import { createProvider } from './provider';
import { getNetworkConfigByType } from './networks';

const signers: Record<string, Promise<ethers.Signer>> = {};

export const createSigner = async function (privateKey: string): Promise<ethers.Signer> {
    const provider = await createProvider();
    const signer = new ethers.Wallet(privateKey, provider);
    return signer;
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
