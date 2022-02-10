import { AuctionInitialInfo } from 'auctions-core/dist/src/types';

function participate(auction: AuctionInitialInfo) {
    /*
      NOTE: Participate has to be able to be called multiple times even if the last execution might still be running without breaking anything!

      Check if we have a private key
      enrich auction from AuctionInitalInfo to AuctionTransaction
      check if profitMinusFees is bigger than AUCTION_MIN_PROFIT (env variable)
      if yes process to the first authorisation, if no return

      cache authorisation steps (memozizze)
      if (!auth1) authorize auth1; (authorizeWallet)
      recall the function with fresh auction

      if (!auth2) authorize auth2; (authorizeCollateral)
      recall the function with fresh auction

      check if the auction is already being executing
      Execute auction (bidOnTheAuction)
    */
}

export default participate;
