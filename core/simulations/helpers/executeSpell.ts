import BigNumber from '../../src/bignumber';
import hre from 'hardhat';
import { TEST_NETWORK } from '../../helpers/constants';
import getContract from '../../src/contracts';
import { MKR_NUMBER_OF_DIGITS } from '../../src/constants/UNITS';
import { addMkrToBalance } from '../../helpers/hardhat/balance';

const ONE_HOUR_SECONDS = 60 * 60;
const ONE_DAY_SECONDS = ONE_HOUR_SECONDS * 24;

const ethers = hre.ethers;
const provider = hre.network.provider;

const getMaximumVotingPoverInMkr = async () => {
    const chiefContract = await getContract(TEST_NETWORK, 'MCD_ADM');
    const hatAddress = await chiefContract.hat();
    const approvals = await chiefContract.approvals(hatAddress);
    return new BigNumber(approvals._hex).shiftedBy(-MKR_NUMBER_OF_DIGITS);
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

const calculateCastTimestamp = async () => {
    // replication of the pause proxy logic
    // https://github.com/makerdao/dss-exec-lib/blob/c0438a97da8e2f697f0e3fd95e9ee522d2586683/src/test/DssExec.t.sol#L370-L381
    const pauseContract = await getContract(TEST_NETWORK, 'MCD_PAUSE');
    const minimumDelayInSeconds = new BigNumber((await pauseContract.delay())._hex).toNumber();
    const currentSeconds = (await ethers.provider.getBlock('latest')).timestamp;
    // standard castTime is current time + the delay
    let castTime = currentSeconds + minimumDelayInSeconds;
    // make sure cast day is a weekday
    const dayOfTheWeek = (castTime / ONE_DAY_SECONDS + 3) % 7;
    if (dayOfTheWeek >= 5) {
        castTime += ONE_DAY_SECONDS * 7 - dayOfTheWeek * ONE_DAY_SECONDS;
    }
    // make sure cast hour is a working hour
    const hourOfTheDay = (castTime / ONE_DAY_SECONDS) % 24;
    if (hourOfTheDay >= 21) {
        castTime += ONE_DAY_SECONDS - hourOfTheDay * ONE_HOUR_SECONDS + ONE_HOUR_SECONDS * 14;
    } else if (hourOfTheDay < 14) {
        castTime += ONE_HOUR_SECONDS * 14 - hourOfTheDay * ONE_HOUR_SECONDS;
    }
    return castTime;
};

const executeSpell = async function (spellAddress: string) {
    console.info(`executing spell "${spellAddress}": minting enough MKR...`);
    const maximumVotingPoverMkr = await getMaximumVotingPoverInMkr();
    await addMkrToBalance(maximumVotingPoverMkr.plus(1));

    console.info(`executing spell "${spellAddress}": voting for the spell...`);
    await voteForSpell(spellAddress, maximumVotingPoverMkr.plus(1));
    const spellAbi = ['function schedule() external', 'function cast() external'];
    const spellContract = await ethers.getContractAt(spellAbi, spellAddress);

    console.info(`executing spell "${spellAddress}": scheduling spell...`);
    await spellContract.schedule();

    console.info(`executing spell "${spellAddress}": warping time...`);
    await provider.request({
        method: 'evm_setNextBlockTimestamp',
        params: [await calculateCastTimestamp()],
    });

    console.info(`executing spell "${spellAddress}": casting...`);
    await spellContract.cast();
};

export default executeSpell;
