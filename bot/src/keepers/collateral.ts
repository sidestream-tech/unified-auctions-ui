import { AuctionInitialInfo } from 'auctions-core/src/types';
import { bidWithCallee, enrichAuction } from 'auctions-core/src/auctions';
import getSigner from 'auctions-core/src/signer';
import { fetchVATbalanceDAI, fetchBalanceDAI } from 'auctions-core/src/wallet';
import { KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI } from '../variables';
import { checkAndAuthorizeCollateral, checkAndAuthorizeWallet } from '../authorisation';
import { setupWallet } from '../signer';

let isSetupCompleted = false;
const currentlyExecutedAuctions = new Set();

export const setupCollateralKeeper = async function (network: string) {
    await setupWallet(network);
    if (Number.isNaN(KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI)) {
        console.info(
            'collateral keeper: no KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI env variable provided, keeper will not run'
        );
        return;
    }
    console.info(
        `collateral keeper: setup complete, looking for minimum net profit of "${KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI}" DAI`
    );
    isSetupCompleted = true;
};

const checkAndParticipateIfPossible = async function (network: string, auction: AuctionInitialInfo) {
    // check if setupCollateralKeeper hasn't run
    if (!isSetupCompleted) {
        return;
    }

    const signer = await getSigner(network);

    // enrich the auction with more numbers
    const auctionTransaction = await enrichAuction(network, auction);

    // check if auction became inactive or finished
    if (auctionTransaction.isFinished) {
        console.info(`collateral keeper: auction "${auction.id}" has already finished`);
        return;
    }
    if (!auctionTransaction.isActive) {
        console.info(`collateral keeper: auction "${auction.id}" is inactive`);
        return;
    }

    // check if callee is valid
    if (!auctionTransaction.suggestedMarketId) {
        console.info(`collateral keeper: auction "${auction.id}" has no valid market`);
        return;
    }

    // check auction's gross profit
    if (!auctionTransaction.transactionGrossProfit || auctionTransaction.transactionGrossProfit.isLessThan(0)) {
        if (auctionTransaction.transactionGrossProfit) {
            const grossProfit = `${auctionTransaction.transactionGrossProfit.toFixed(0)} DAI`;
            console.info(
                `collateral keeper: auction "${auction.id}" is not yet executable (current gross profit: ${grossProfit})`
            );
        } else {
            console.info(`collateral keeper: auction "${auction.id}" is not tradable`);
        }
        return;
    }
    const grossProfit = `${auctionTransaction.transactionGrossProfit.toFixed(0)} DAI`;
    console.info(
        `collateral keeper: auction "${auction.id}" gross profit is ${grossProfit}, moving on to check net profit`
    );

    // check auction's net profit – profit without transaction fees
    if (
        auctionTransaction.transactionNetProfit &&
        auctionTransaction.transactionNetProfit.toNumber() < KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI
    ) {
        console.info(
            `collateral keeper: auction "${
                auction.id
            }" net profit is smaller than min net profit (${auctionTransaction.transactionNetProfit.toFixed(
                0
            )} < ${KEEPER_COLLATERAL_MINIMUM_NET_PROFIT_DAI})`
        );
        return;
    } else {
        console.info(
            `collateral keeper: auction "${
                auction.id
            }" net profit is ${auctionTransaction.transactionNetProfit.toFixed(
                0
            )} DAI after transaction fees, moving on to the execution`
        );
    }

    const walletAddress = await signer.getAddress();

    // try to authorize the wallet then return
    const wasWalletNewlyAuthorized = await checkAndAuthorizeWallet(network, walletAddress);
    if (wasWalletNewlyAuthorized) {
        // restart auction evaluation in case authorization was executed
        await checkAndParticipateIfPossible(network, auction);
        return;
    }

    // check the collateral authorization status and authorize if needed
    const wasCollateralNewlyAuthorized = await checkAndAuthorizeCollateral(
        network,
        walletAddress,
        auctionTransaction.collateralType
    );
    if (wasCollateralNewlyAuthorized) {
        // restart auction evaluation in case authorization was executed
        await checkAndParticipateIfPossible(network, auction);
        return;
    }

    // save previous balances
    const preVatBalanceDai = await fetchVATbalanceDAI(network, walletAddress);
    const preErcBalanceDai = await fetchBalanceDAI(network, walletAddress);

    // bid on the Auction
    console.info(`collateral keeper: auction "${auctionTransaction.id}": attempting swap execution`);
    const bidHash = await bidWithCallee(
        network,
        auctionTransaction,
        auctionTransaction.suggestedMarketId,
        walletAddress
    );
    console.info(
        `collateral keeper: auction "${auctionTransaction.id}" was succesfully executed via "${bidHash}" transaction`
    );

    // display profit
    const postVatBalanceDai = await fetchVATbalanceDAI(network, walletAddress);
    const postErcBalanceDai = await fetchBalanceDAI(network, walletAddress);
    console.info(`DAI VAT   profit from the transaction: ${postVatBalanceDai.minus(preVatBalanceDai).toFixed()}`);
    console.info(`DAI ERC20 profit from the transaction: ${postErcBalanceDai.minus(preErcBalanceDai).toFixed()}`);
};

const participateInAuction = async function (network: string, auction: AuctionInitialInfo) {
    // check if this auction is currently executed to avoid double execution
    if (currentlyExecutedAuctions.has(auction.id)) {
        return;
    }
    currentlyExecutedAuctions.add(auction.id);

    // execute
    try {
        await checkAndParticipateIfPossible(network, auction);
    } catch (error) {
        console.error(
            `collateral keeper: unexpected error: ${(error instanceof Error && error.message) || 'unknown'}`
        );
    }

    // clear pool of currently executed auctions
    currentlyExecutedAuctions.delete(auction.id);
};

export const participate = async function (network: string, auctions: AuctionInitialInfo[]) {
    for (const auction of auctions) {
        await participateInAuction(network, auction);
    }
};

export default participate;
