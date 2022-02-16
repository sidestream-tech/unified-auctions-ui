import { AuctionInitialInfo } from 'auctions-core/src/types';
import getSigner from 'auctions-core/src/signer';
import { enrichAuction } from 'auctions-core/src/auctions';

const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK || 'kovan';
const MIN_PROFIT_DAI = process.env.MIN_PROFIT_DAI || 100;

async function participate(auction: AuctionInitialInfo) {
    const signer = getSigner(ETHEREUM_NETWORK);
    console.info(signer);
    const auctionTransaction = await enrichAuction(ETHEREUM_NETWORK, auction);
    console.info(auctionTransaction);
    console.info(MIN_PROFIT_DAI);
    /*
      NOTE: Participate has to be able to be called multiple times even if the last execution might still be running without breaking anything!

      Check if we have a private key
      enrich auction from AuctionInitalInfo to AuctionTransaction
      check if profitMinusFees is bigger than AUCTION_MIN_PROFIT (env variable)
      if yes process to the first authorisation, if no return

      if (!auth2) authorize auth2; (authorizeCollateral)
      recall the function with fresh auction

      check if the auction is already being executing
      Execute auction (bidOnTheAuction)
    */
}

export default participate;
