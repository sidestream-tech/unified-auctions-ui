import { expect } from 'chai';
import { fetchActiveSurplusAuctions, bidToSurplusAuction } from '../src/surplus';
import { setAllowanceAmountMKR } from '../src/authorizations';
import getSigner, { setSigner, createSigner } from '../src/signer';
import WETH from './abis/WETH.json';
import UNISWAP from './abis/UNISWAP.json';

import { Notifier, SurplusAuctionActive } from '../src/types';
import hre, { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { WAD_NUMBER_OF_DIGITS } from '../src/constants/UNITS';
import BigNumber from '../src/bignumber';
import { getGasParametersForTransaction } from '../src/gas';
import { getNetworkConfigByType } from '../src/constants/NETWORKS';
import trackTransaction from '../src/tracker';
import getNetworkDate from '../src/date';

const canTransactionBeConfirmed = function (network: string, confirmTransaction?: boolean) {
    const networkConfig = getNetworkConfigByType(network);
    if (networkConfig.isFork) {
        return false;
    }
    return confirmTransaction;
};

const ALCHEMY_URL = process.env.ALCHEMY_URL;
const HARDHAT_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // deterministic private key from hardhat.

async function createWalletFromPrivateKey(privateKey: string, network: string) {
    setSigner(network, createSigner(network, privateKey));
    const signer = await getSigner(network);
    return await signer.getAddress();
}

export const swapToMKR = async function (
    network: string,
    amountPaidAllowanceETH: string | number,
    amountReceivedMinMKR: string | number,
    notifier?: Notifier
) {
    const signer = await getSigner(network);
    const address = await signer.getAddress();
    const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const UNISWAP_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const MKR_ADDRESS = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2';
    const contractWeth = await new Contract(WETH_ADDRESS, WETH, signer);
    const contractUniswap = await new Contract(UNISWAP_ADDRESS, UNISWAP, signer);

    // Allow operations with the uniswap to swap from weth
    const gasParameters = await getGasParametersForTransaction(network);
    let transactionPromise = contractWeth['approve'](
        ...[UNISWAP_ADDRESS, new BigNumber(amountPaidAllowanceETH).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0)],
        {
            ...gasParameters,
            type: gasParameters.gasPrice ? undefined : 2,
        }
    );

    await trackTransaction(transactionPromise, notifier, canTransactionBeConfirmed(network));

    //Get some eth
    await trackTransaction(
        contractWeth.deposit({
            value: ethers.utils.parseEther(String(amountPaidAllowanceETH)),
        }),
        notifier,
        canTransactionBeConfirmed(network)
    );

    // get some mkr
    const deadline = await getNetworkDate(network);
    deadline.setHours(deadline.getDate() + 1);
    const transactionParamsSwapMkr = [
        new BigNumber(amountReceivedMinMKR).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        [WETH_ADDRESS, MKR_ADDRESS],
        address,
        new BigNumber(Math.floor(deadline.getTime() / 1000)).toFixed(0),
    ];
    const gasParametersSwapMKR = await getGasParametersForTransaction(network);
    transactionPromise = contractUniswap['swapETHForExactTokens'](...transactionParamsSwapMkr, {
        ...gasParametersSwapMKR,
        type: gasParametersSwapMKR.gasPrice ? undefined : 2,
        value: new BigNumber(amountPaidAllowanceETH).shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
    });
    await trackTransaction(transactionPromise, notifier, canTransactionBeConfirmed(network));

};

describe('Surplus Auction', () => {
    beforeEach(async () => {
        await hre.network.provider.request({
            method: 'hardhat_reset',
            params: [
                {
                    forking: {
                        jsonRpcUrl: ALCHEMY_URL,
                        blockNumber: 14078339,
                    },
                },
            ],
        });
    });
    it('fetches active auctions', async () => {
        const auctions = await fetchActiveSurplusAuctions('localhost');
        expect(auctions.length).to.equal(5);
        expect(auctions[0].id).to.equal(2328);
        expect(auctions[0].state).to.equal('have-bids');
    });
    it('participates in active auction', async () => {
        const address = await createWalletFromPrivateKey(HARDHAT_PRIVATE_KEY, 'localhost');
        await setAllowanceAmountMKR('localhost', address);
        await swapToMKR('localhost', 20, 20);
        await bidToSurplusAuction('localhost', 2328, '20');
        const auctions = await fetchActiveSurplusAuctions('localhost');
        const currentAuction = auctions[0] as SurplusAuctionActive;
        expect(currentAuction.id).to.equal(2328);
        expect(currentAuction.bidAmountMKR.eq(20)).to.be.true;
    });
});
