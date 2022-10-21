import BigNumber from '../../src/bignumber';
import hre from 'hardhat';
import { TEST_NETWORK } from '../../helpers/constants';
import getContract from '../../src/contracts';
import getSigner from '../../src/signer';
import { overwriteUintMapping } from '../../helpers/hardhat/slotOverwrite';
import { MKR_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

const ethers = hre.ethers;
const provider = hre.network.provider;

const getMaximumVotingPoverInMkr = async () => {
    const chiefContract = await getContract(TEST_NETWORK, 'MCD_ADM');
    const hatAddress = await chiefContract.hat();
    const approvals = await chiefContract.approvals(hatAddress);
    return new BigNumber(approvals._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
};

const setGovernanceMkr = async (mkrAmount: BigNumber) => {
    const signer = await getSigner(TEST_NETWORK);
    const currentAddress = await signer.getAddress();
    const govContract = await getContract(TEST_NETWORK, 'MCD_GOV');
    const currentBalance = await govContract.balanceOf(currentAddress);
    await overwriteUintMapping('MCD_GOV', '0x01', currentAddress, mkrAmount.shiftedBy(MKR_NUMBER_OF_DIGITS));
    const newBalance = await govContract.balanceOf(currentAddress);
    if (newBalance._hex === currentBalance._hex) {
        throw new Error(
            `governance MKR balance doesn't seem to change: ${ethers.utils.formatEther(
                currentBalance
            )}, ${ethers.utils.formatEther(newBalance)}`
        );
    }
};

const voteForSpell = async (spellAddress: string, mkrAmount: BigNumber) => {
    const govContract = await getContract(TEST_NETWORK, 'MCD_GOV', true);
    const chiefContract = await getContract(TEST_NETWORK, 'MCD_ADM', true);
    const mkrAmountInteger = mkrAmount.shiftedBy(MKR_NUMBER_OF_DIGITS).toFixed(0);
    await govContract['approve(address,uint256)'](chiefContract.address, mkrAmountInteger);
    await chiefContract.lock(mkrAmountInteger);
    await chiefContract.etch([spellAddress]);
    const slate = ethers.utils.keccak256(ethers.utils.hexZeroPad(spellAddress, 32));
    await chiefContract['vote(bytes32)'](slate);
    await chiefContract.lift(spellAddress);
};

const executeSpell = async function (spellAddress: string) {
    console.info(`executing spell "${spellAddress}": minting enough MKR...`);
    const maximumVotingPoverMkr = await getMaximumVotingPoverInMkr();
    await setGovernanceMkr(maximumVotingPoverMkr.plus(1));

    console.info(`executing spell "${spellAddress}": voting for the spell...`);
    await voteForSpell(spellAddress, maximumVotingPoverMkr.plus(1));
    const spellAbi = ['function schedule() external', 'function cast() external'];
    const spellContract = await ethers.getContractAt(spellAbi, spellAddress);

    console.info(`executing spell "${spellAddress}": scheduling spell...`);
    await spellContract.schedule();

    console.info(`executing spell "${spellAddress}": warping time...`);
    const block = await ethers.provider.getBlock('latest');
    await provider.request({
        method: 'evm_setNextBlockTimestamp',
        params: [block.timestamp + ONE_WEEK_SECONDS],
    });

    console.info(`executing spell "${spellAddress}": casting...`);
    await spellContract.cast();
};

export default executeSpell;
