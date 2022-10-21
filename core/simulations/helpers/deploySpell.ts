import { ethers } from 'ethers';
import getSigner from '../../src/signer';
import compiledSpells from '../../bytecode/compiledSpells.json';

const deploySpell = async function (network: string, name: string): Promise<string> {
    console.info(`deploying spell ${name}`);

    if (!(name in compiledSpells)) {
        throw new Error(`spel "${name}" not found in compiled spells`);
    }
    const bytecode: string = (compiledSpells as Record<string, string>)[name];

    const signer = await getSigner(network);
    const factory = new ethers.ContractFactory([], bytecode, signer);
    const contract = await factory.deploy();
    await contract.deployTransaction.wait();
    console.info(`spell has been deployed at ${contract.address}`);
    return contract.address;
};

export default deploySpell;
