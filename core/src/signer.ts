import { ethers } from 'ethers';
import { getNetworkConfigByType } from './network';
import { createProvider } from './provider';

const signers: Record<string, Promise<ethers.Signer>> = {};

export const createSigner = async function (network: string, privateKey: string): Promise<ethers.Signer> {
    const provider = await createProvider(network);
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

export const createWalletFromPrivateKey = async (privateKey: string, network: string) => {
    setSigner(network, createSigner(network, privateKey));
    const signer = await getSigner(network);
    return await signer.getAddress();
};

export default getSigner;
