import { ethers } from 'ethers';
import { createProvider } from './provider';

const signers: Record<string, Promise<ethers.Signer>> = {};

export const createSigner = async function (
    privateKey: string,
    provider?: ethers.providers.BaseProvider
): Promise<ethers.Signer> {
    return new ethers.Wallet(privateKey, provider || (await createProvider()));
};

export function setSigner(network: string, signer: Promise<ethers.Signer>) {
    signers[network] = signer;
}

const getSigner = function (network: string): Promise<ethers.Signer> {
    if (!signers[network]) {
        throw new Error(`No signer has been created for the "${network}" network`);
    }
    return signers[network];
};

export default getSigner;
