// import { expect } from "chai";
// import { getContractAddressByName } from "../src/contracts"
import hre from 'hardhat';
import { setupRpcUrlAndGetNetworks } from '../src/rpc';
import contractInterface from './spell.json';
// import contractExecutorAbi from './exec.json'

describe('Collateral was deployed', () => {
    before(async () => {
        const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
        await setupRpcUrlAndGetNetworks(local_rpc_url);
    });
    it('has the collateral in chain', async () => {
        const impersonatedAddress = '0x5cab1E5286529370880776461C53A0e47d74FB63'
        await hre.network.provider.request({
            method: 'hardhat_impersonateAccount',
            params: [impersonatedAddress],
        });
        const signer = await hre.ethers.getSigner(impersonatedAddress)
        const contractAddress = '0x21dF544947ba3E8b3c32561399E88B52Dc8b2823';
        const contract = await new hre.ethers.Contract(contractAddress, contractInterface, signer);
        await contract.schedule();
        const two = "0x2";
        const day = "0x15180";
        await hre.network.provider.send("hardhat_mine", [two, day]);
        await contract.cast();
    });
});
