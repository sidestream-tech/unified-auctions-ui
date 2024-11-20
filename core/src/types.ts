import BigNumber from 'bignumber.js';

export declare interface GasParameters {
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasPrice?: string;
}

export declare interface AuctionInitialInfo {
    network: string;
    id: string;
    index: number;
    collateralType: string;
    collateralSymbol: string;
    tokenName: string;
    collateralAmount: BigNumber;
    debtDAI: BigNumber;
    startDate: Date;
    endDate: Date;
    vaultAddress: string;
    isActive: boolean;
    isFinished: boolean;
    isRestarting: boolean;
    suggestedMarketId?: string;
    marketDataRecords?: Record<string, MarketData>;
    marketUnitPrice?: BigNumber;
    marketUnitPriceToUnitPriceRatio?: BigNumber;
    transactionGrossProfit?: BigNumber;
    transactionAddress?: string;
    initialPrice: BigNumber;
    fetchedAt: Date;
}

export declare interface AuctionStatus {
    isActive: boolean;
    debtDAI: BigNumber;
    collateralAmount: BigNumber;
    unitPrice: BigNumber;
    totalPrice: BigNumber;
}

export declare interface Auction extends AuctionInitialInfo {
    collateralToCoverDebt: BigNumber;
    unitPrice: BigNumber;
    totalPrice: BigNumber;
    approximateUnitPrice: BigNumber;
    secondsBetweenPriceDrops?: number;
    secondsTillNextPriceDrop?: number;
    priceDropRatio?: BigNumber;
    transactionGrossProfitDate?: Date;
    minimumBidDai: BigNumber;
}

export declare interface TransactionFees {
    bidTransactionFeeETH: BigNumber;
    bidTransactionFeeDAI: BigNumber;
    swapTransactionFeeETH: BigNumber;
    swapTransactionFeeDAI: BigNumber;
    authTransactionFeeETH: BigNumber;
    authTransactionFeeDAI: BigNumber;
    restartTransactionFeeETH: BigNumber;
    restartTransactionFeeDAI: BigNumber;
}

export declare interface CollateralRow extends CollateralConfig, Partial<MakerParams> {
    marketUnitPrice?: BigNumber | string;
    tokenAddress?: string;
    tokenAddressError?: string;
    autoRouteQuote?: BigNumber;
    autoRouteExchanges?: string[];
    autoRouteError?: string;
}

export declare interface AuctionTransaction extends Auction, TransactionFees {
    transactionNetProfit: BigNumber;
    combinedBidFeesDAI: BigNumber;
    combinedBidFeesETH: BigNumber;
    combinedSwapFeesDAI: BigNumber;
    combinedSwapFeesETH: BigNumber;
}

export declare interface RegularCalleeConfig {
    callee:
        | 'UniswapV2CalleeDai'
        | 'WstETHCurveUniv3Callee'
        | 'CurveLpTokenUniv3Callee'
        | 'UniswapV3Callee'
        | 'rETHCurveUniv3Callee'
        | 'UniswapV2LockstakeCallee';
    route: string[];
}

export declare interface AutoRouterCalleeConfig {
    callee: 'UniswapV3Callee';
    automaticRouter: true;
}

export declare interface OneInchCalleeConfig {
    callee: 'OneInchCallee';
}

export declare interface UniswapV2LpTokenCalleeConfig {
    callee: 'UniswapV2LpTokenCalleeDai';
    token0: string;
    token1: string;
}

export declare interface ExchangeFees {
    exchangeFeeETH: BigNumber;
    exchangeFeeDAI: BigNumber;
}

declare interface MarketDataBase extends Partial<ExchangeFees> {
    marketUnitPrice: BigNumber;
    marketUnitPriceToUnitPriceRatio?: BigNumber;
    transactionGrossProfit?: BigNumber;
    transactionGrossProfitDate?: Date;
    transactionNetProfit?: BigNumber;
    errorMessage?: any;
}

export declare interface Pool {
    addresses: string[];
    fee: number;
    routes: string[];
}

export declare interface MarketDataRegular extends MarketDataBase {
    pools: Pool[];
}

export declare interface MarketDataOneInch extends MarketDataBase {
    oneInch: {
        to: string;
        path: string[];
        calleeData: string;
        exchangeFeeEth: BigNumber;
        exchangeFeeDai: BigNumber;
    };
}

export declare interface MarketDataUniswapV2LpToken
    extends MarketDataBase,
        Omit<UniswapV2LpTokenCalleeConfig, 'callee'> {}

export type MarketData = MarketDataRegular | MarketDataUniswapV2LpToken | MarketDataOneInch;

export declare interface ValueSlotAddressAndOffset {
    slot: string;
    offset: number;
}

export declare interface CollateralAddresses {
    token: string;
    join?: string;
    pip: string;
    clip: string;
    calc: string;
}

export type CalleeConfig =
    | RegularCalleeConfig
    | AutoRouterCalleeConfig
    | UniswapV2LpTokenCalleeConfig
    | OneInchCalleeConfig;
export declare interface CollateralConfig {
    title: string;
    ilk: string;
    symbol: string;
    tokenName: string;
    decimals: number;
    isActive: boolean;
    exchanges: Record<string, CalleeConfig>;
    oracle: CollateralPriceSourceConfig;
    contracts: CollateralAddresses;
}

interface OracleConfigBase {
    hasDelay: boolean;
    slotPriceValueBeginsAtPosition: number;
    currentPriceSlotAddress: string;
}

export declare interface OracleCurrentAndNextPrices extends OracleConfigBase {
    type: 'CurrentAndNextPrice';
    nextPriceSlotAddress: string;
}

export declare interface OracleCurrentPriceOnly extends OracleConfigBase {
    type: 'CurrentPriceOnly';
    currentPriceValiditySlotAndOffset: ValueSlotAddressAndOffset;
}

export type CollateralPriceSourceConfig = OracleCurrentAndNextPrices | OracleCurrentPriceOnly;

export declare interface NetworkConfig {
    chainId: string;
    type: string;
    title: string;
    url: string;
    gasPrice?: number;
    etherscanUrl: string;
    isFork: boolean;
}

export declare interface CalleeAddresses {
    UniswapV2CalleeDai: string;
    UniswapV2LpTokenCalleeDai: string;
    WstETHCurveUniv3Callee?: string;
    CurveLpTokenUniv3Callee?: string;
    UniswapV3Callee?: string;
    rETHCurveUniv3Callee?: string;
    OneInchCallee?: string;
    UniswapV2LockstakeCallee?: string;
}

export type CalleeNames = keyof CalleeAddresses;

export interface PriceWithPools {
    price: BigNumber;
    pools?: Pool[];
}

export declare interface CalleeFunctions {
    getCalleeData: (
        network: string,
        collateral: CollateralConfig,
        marketId: string,
        profitAddress: string,
        params?: GetCalleeDataParams
    ) => Promise<string>;
    getMarketPrice: (
        network: string,
        collateral: CollateralConfig,
        marketId: string,
        amount: BigNumber
    ) => Promise<PriceWithPools>;
}

export declare interface MakerParams {
    secondsBetweenPriceDrops: number;
    priceDropRatio: BigNumber;
}

export declare interface MessageContent {
    key: string;
    content: string;
    duration: number;
}

export declare interface Notifier {
    (messageType: 'loading' | 'error' | 'success' | 'info', messageContent: MessageContent): void;
}

export declare interface TakeEvent {
    transactionHash: string;
    blockNumber: number;
    transactionDate?: Date;
}

export declare interface WalletBalances {
    walletETH: BigNumber;
    walletDAI: BigNumber;
    walletMKR: BigNumber;
    walletVatDAI: BigNumber;
    walletLastUpdatedDate: Date;
}

export declare interface CollateralStatus {
    type: string;
    symbol: string;
    tokenName: string;
    isAuthorized: boolean;
    isAuthorizing: boolean;
    isDepositingOrWithdrawing: boolean;
    address?: string | null;
    balance?: BigNumber;
}

export declare type CompensationAuctionActiveState =
    | 'just-started'
    | 'have-bids'
    | 'ready-for-collection'
    | 'requires-restart';
export declare type CompensationAuctionInactiveState = 'collected';

export declare type CompensationAuctionActionStates = 'loaded' | 'restarting' | 'bidding' | 'collecting';

export declare interface CompensationAuctionBase {
    id: number;
    network: string;
    fetchedAt: Date;
}

export declare interface CompensationAuctionTransactionFees {
    restartTransactionFeeEth: BigNumber;
    allowanceTransactionFeeEth: BigNumber;
    bidTransactionFeeEth: BigNumber;
    collectTransactionFeeEth: BigNumber;
    authTransactionFeeEth: BigNumber;
    combinedBidFeesEth: BigNumber;
    allowanceTransactionFeeDai: BigNumber;
    restartTransactionFeeDai: BigNumber;
    bidTransactionFeeDai: BigNumber;
    collectTransactionFeeDai: BigNumber;
    authTransactionFeeDai: BigNumber;
    combinedBidFeesDai: BigNumber;
}

export declare interface SurplusAuctionActive extends CompensationAuctionBase {
    bidAmountMKR: BigNumber;
    receiveAmountDAI: BigNumber;
    receiverAddress: string;
    auctionEndDate: Date;
    bidEndDate?: Date;
    auctionStartDate: Date;
    earliestEndDate: Date;
    state: CompensationAuctionActiveState;
}

export declare interface SurplusAuctionCollected extends CompensationAuctionBase {
    state: CompensationAuctionInactiveState;
}

export type SurplusAuction = SurplusAuctionActive | SurplusAuctionCollected;

export type SurplusAuctionStates = SurplusAuction['state'];

export declare interface SurplusAuctionEnriched extends SurplusAuctionActive {
    nextMinimumBid: BigNumber;
    marketUnitPrice: BigNumber;
    marketUnitPriceToUnitPriceRatio: BigNumber;
    unitPrice: BigNumber;
}

export declare interface CompensationAuctionTransactionFees {
    restartTransactionFeeEth: BigNumber;
    allowanceTransactionFeeEth: BigNumber;
    bidTransactionFeeEth: BigNumber;
    collectTransactionFeeEth: BigNumber;
    authTransactionFeeEth: BigNumber;
    combinedBidFeesEth: BigNumber;
    allowanceTransactionFeeDai: BigNumber;
    restartTransactionFeeDai: BigNumber;
    bidTransactionFeeDai: BigNumber;
    collectTransactionFeeDai: BigNumber;
    authTransactionFeeDai: BigNumber;
    combinedBidFeesDai: BigNumber;
}

export declare interface SurplusAuctionTransaction
    extends SurplusAuctionEnriched,
        CompensationAuctionTransactionFees {}

export declare interface DebtAuctionBase {
    id: number;
    network: string;
    fetchedAt: Date;
}

export declare interface DebtAuctionActive extends DebtAuctionBase {
    bidAmountDai: BigNumber;
    receiveAmountMKR: BigNumber;
    receiverAddress: string;
    auctionEndDate: Date;
    auctionStartDate: Date;
    bidEndDate?: Date;
    earliestEndDate: Date;
    state: CompensationAuctionActiveState;
}

export declare interface DebtAuctionCollected extends DebtAuctionBase {
    state: CompensationAuctionInactiveState;
}

export type DebtAuction = DebtAuctionActive | DebtAuctionCollected;

export type DebtAuctionStates = DebtAuction['state'];

export type DebtAuctionActionStates = 'loaded' | 'restarting' | 'bidding' | 'collecting';

export declare interface DebtAuctionEnriched extends DebtAuctionActive {
    nextMaximumLotReceived: BigNumber;
    marketUnitPrice: BigNumber;
    marketUnitPriceToUnitPriceRatio: BigNumber;
    unitPrice: BigNumber;
}

export declare interface DebtAuctionTransaction extends DebtAuctionEnriched, CompensationAuctionTransactionFees {}

export type CollateralType = CollateralConfig['ilk'];
export type CollateralSymbol = CollateralConfig['symbol'];

export declare interface LiquidationLimits {
    maximumProtocolDebtDai: BigNumber;
    currentProtocolDebtDai: BigNumber;
    currentCollateralDebtDai: BigNumber;
    maximumCollateralDebtDai: BigNumber;
    liquidationPenaltyRatio: BigNumber;
    minimalAuctionedDai: BigNumber;
}

export declare interface VaultCollateralParameters {
    stabilityFeeRate: BigNumber;
    minUnitPrice: BigNumber;
}

export declare interface VaultBase {
    address: string;
    collateralType: CollateralType;
    network: string;
}

export declare interface VaultAmount {
    initialDebtDai: BigNumber;
    collateralAmount: BigNumber;
}

export declare interface VaultTransactionFees {
    transactionFeeLiquidationEth: BigNumber;
    transactionFeeLiquidationDai: BigNumber;
}

export declare interface Vault extends VaultBase, VaultAmount, VaultCollateralParameters, LiquidationLimits {
    lastSyncedAt: Date;
}

export declare interface OraclePrices {
    currentUnitPrice: BigNumber;
    nextUnitPrice: BigNumber;
    nextPriceChange: Date;
}

export declare interface LiquidationEvent {
    liquidationDate: Date;
    transactionHash: string;
    auctionId: string;
}
export declare interface VaultTransactionLiquidated extends VaultBase {
    state: 'liquidated';
    pastLiquidations: LiquidationEvent[];
}
export declare type GetCalleeDataParams = { pools: Pool[] } | { oneInchParams: { txData: string; to: string } };

export declare interface VaultTransactionBase extends Vault, VaultTransactionFees, OraclePrices {
    liquidationRatio: BigNumber;
    collateralizationRatio: BigNumber;
    proximityToLiquidation: BigNumber;
    incentiveRelativeDai: BigNumber;
    incentiveConstantDai: BigNumber;
    incentiveCombinedDai: BigNumber;
    grossProfitDai: BigNumber;
    netProfitDai: BigNumber;
    debtDai: BigNumber;
}

export declare interface VaultTransactionNotLiquidated extends VaultTransactionBase {
    state: 'liquidatable' | 'not-liquidatable';
}

export type VaultTransaction = VaultTransactionLiquidated | VaultTransactionNotLiquidated;
export type VaultTransactionState = VaultTransaction['state'];
