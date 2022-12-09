import { ethers } from 'ethers';
import getSigner from '../../src/signer';
import compiledSpells from '../../bytecode/compiledSpells.json';
import { resetNetworkAndSetupWallet } from '../../helpers/hardhat/network';

interface SpellConfigBytecode {
    block?: number;
    bytecode: string;
}
interface SpellConfigAddress {
    block?: number;
    address: string;
}
type SpellConfig = SpellConfigBytecode | SpellConfigAddress;

export const getAllSpellNames = function (): string[] {
    return Object.keys(compiledSpells).sort();
};

const deploySpell = async function (network: string, name: string): Promise<string> {
    console.info(`Deploying spell "${name}"`);

    if (!(name in compiledSpells)) {
        throw new Error(`spell "${name}" not found in compiled spells`);
    }
    const spellConfig = (compiledSpells as Record<string, SpellConfig>)[name];
    await resetNetworkAndSetupWallet(spellConfig.block);

    if ('address' in spellConfig) {
        console.info(`Spell is already deployed at ${spellConfig.address}`);
        return spellConfig.address;
    }
    const signer = await getSigner(network);
    const factory = new ethers.ContractFactory([], spellConfig.bytecode, signer);
    const contract = await factory.deploy();
    await contract.deployTransaction.wait();
    console.info(`Spell has been deployed at ${contract.address}`);
    return contract.address;
};

export default deploySpell;
