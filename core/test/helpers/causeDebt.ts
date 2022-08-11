import getContract, { getContractAddressByName } from '../../src/contracts'
import BigNumber from '../../src/bignumber'
import { RAD_NUMBER_OF_DIGITS } from '../../src/constants/UNITS'
import { EthereumProvider } from 'hardhat/types'
import hre from 'hardhat'

export const causeDebt = async (network: string, provider: EthereumProvider) => {
    await overwriteSin(network, provider)
    await ensureSinEqual(network, '9000000000000000000000000000000000000000000000')
}

export const overwriteSin = async (network: string, provider: EthereumProvider) => {
    const contract_address = await getContractAddressByName(network, 'MCD_VOW')
    const slot_address = "0x5"
    const new_value = hre.ethers.utils.hexZeroPad("0x" + (new BigNumber(9)).shiftedBy(RAD_NUMBER_OF_DIGITS).toString(16), 32)
    const storageToWrite = [contract_address, slot_address, new_value];
    await provider.send('hardhat_setStorageAt', storageToWrite)
}

export const ensureSinEqual = async (network: string, expected: string) => {
    const contract = await getContract(network, 'MCD_VOW')
    const sinAsHex = await contract.Sin()
    const sin = new BigNumber(sinAsHex._hex).toFixed()
    if (sin === expected) {
        return
    }
    throw new Error(`Unexpected Sin value ${sin}, expected ${expected}`)
}
