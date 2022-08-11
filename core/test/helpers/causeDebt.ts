import hre from 'hardhat'
import getContract, { getContractAddressByName } from '../../src/contracts'
import BigNumber from '../../src/bignumber'
import { RAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS'
import { setupRpcUrlAndGetNetworks } from '../../src/rpc'

export const causeDebt = async (network: string) => {
    const local_rpc_url = process.env.LOCAL_RPC_URL || 'http://localhost:8545';
    await setupRpcUrlAndGetNetworks(local_rpc_url);

    await overwriteSin(network)
    await ensureSinEqual(network, '9')
}

export const overwriteSin = async (network: string) => {
    const contract_address = await getContractAddressByName(network, 'MCD_VOW')
    const slot_address = "0x1"
    const new_value = hre.ethers.utils.hexZeroPad((new BigNumber(9)).shiftedBy(RAD_NUMBER_OF_DIGITS).toString(16), 64)
    const storageToWrite = [contract_address, slot_address, new_value];
    await hre.ethers.provider.send('hardhat_setStorageAt', storageToWrite)
}

export const ensureSinEqual = async (network: string, expected: string) => {
    const contract = await getContract(network, 'MCD_VOW')
    const sinAsHex = await contract.Sin()
    const sin = new BigNumber(sinAsHex).toFixed()
    if (sin === expected) {
        return
    }
    throw new Error(`Unexpected Sin value ${sin}, expected ${expected}`)
}
