import BigNumber from 'bignumber.js';
import trackTransaction from './tracker';
import getMaker from '~/lib/maker';
import getWallet from '~/lib/wallet';
import COLLATERALS from '~/lib/constants/COLLATERALS';
import { WAD, RAD, RAY } from '~/lib/constants/UNITS';
import { getExchangeRateBySymbol, getUniswapCalleeBySymbol, getUniswapParametersByCollateral } from '~/lib/uniswap';

const fetchAuctionsByType = async function (type: string, maker: any): Promise<Auction[]> {
    const protoAuctions = await maker.service('liquidation').getAllClips(type);
    const now = new Date();
    return protoAuctions.map((protoAuction: any): Auction => {
        const isActive = protoAuction.active && protoAuction.endDate > now;
        const collateralSymbol = COLLATERALS[protoAuction.ilk].symbol as string;
        const amountRAW = new BigNumber(protoAuction.lot);
        const amountDAI = new BigNumber(protoAuction.tab);
        return {
            id: `${protoAuction.ilk}:${protoAuction.saleId}`,
            auctionId: protoAuction.saleId,
            collateralType: protoAuction.ilk,
            collateralSymbol,
            vaultOwner: protoAuction.usr,
            amountRAW,
            amountDAI,
            amountPerCollateral: amountRAW.dividedBy(amountDAI),
            till: protoAuction.endDate,
            isActive,
            isFinished: false,
            isRestarting: false,
        };
    });
};

const enrichAuctionWithActualNumbers = async function (auction: Auction, network?: string): Promise<Auction> {
    const maker = await getMaker(network);
    if (!auction.isActive) {
        return auction;
    }
    const status = await maker.service('liquidation').getStatus(auction.collateralType, auction.auctionId);
    return {
        ...auction,
        isActive: !status.needsRedo,
        amountRAW: new BigNumber(status.lot).div(WAD),
        amountDAI: new BigNumber(status.tab).div(RAD),
        amountPerCollateral: new BigNumber(status.price).div(RAY),
    };
};

const enrichAuctionWithMarketValues = async function (auction: Auction, network: string): Promise<Auction> {
    if (!auction.isActive) {
        return auction;
    }
    try {
        const marketPricePerCollateral = await getExchangeRateBySymbol(
            network,
            auction.collateralSymbol,
            auction.amountRAW
        );
        const marketValue = auction.amountPerCollateral
            .minus(marketPricePerCollateral)
            .dividedBy(marketPricePerCollateral);
        const transactionProfit = marketPricePerCollateral
            .multipliedBy(auction.amountRAW)
            .minus(auction.amountPerCollateral.multipliedBy(auction.amountRAW));
        return {
            ...auction,
            marketPricePerCollateral,
            marketValue,
            transactionProfit,
        };
    } catch (error) {
        console.warn(`Fetching exchange rates from UniSwap failed for ${auction.id} with error:`, error.message);
        return auction;
    }
};

export const fetchAllAuctions = async function (network: string): Promise<Auction[]> {
    const maker = await getMaker(network);
    const collateralNames = Object.keys(COLLATERALS);

    // get all auctions
    const auctionGroupsPromises = collateralNames.map((collateralName: string) =>
        fetchAuctionsByType(collateralName, maker)
    );
    const auctionGroups = await Promise.all(auctionGroupsPromises);
    const auctions = auctionGroups.flat();

    // enrich them with statuses
    const auctionsWithStatusesPromises = auctions.map((auction: Auction) =>
        enrichAuctionWithActualNumbers(auction, network)
    );
    const auctionsWithStatuses = await Promise.all(auctionsWithStatusesPromises);

    // enrich them with market values
    const auctionsWithMarketValues = await Promise.all(
        auctionsWithStatuses.map(a => enrichAuctionWithMarketValues(a, network))
    );

    return auctionsWithMarketValues;
};

export const restartAuction = async function (collateralType: string, id: number): Promise<string> {
    const wallet = getWallet();
    const maker = await getMaker();
    const clipperContract = maker.service('liquidation')._clipperContractByIlk(collateralType);
    const transaction = clipperContract.redo(id, wallet.address);
    return trackTransaction(transaction, maker);
};

export const bidOnTheAuction = async function (network: string, auction: Auction): Promise<string> {
    const maker = await getMaker();
    const calleeAddress = getUniswapCalleeBySymbol(network, auction.collateralSymbol);
    const flashData = await getUniswapParametersByCollateral(network, auction.collateralType);
    const transaction = maker
        .service('liquidation')
        .take(
            auction.collateralType,
            auction.auctionId,
            auction.amountRAW.toString(),
            auction.amountPerCollateral.toString(),
            calleeAddress,
            flashData
        );
    return trackTransaction(transaction, maker);
};
