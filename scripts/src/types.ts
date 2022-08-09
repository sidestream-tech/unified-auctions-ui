export interface EventData {
    collateralType: string;
    hash: string;
    from: string;
    blockNumber?: number;
    auctionId?: string;
    transactionDate?: string | Date;
    takenAmount?: string;
    maxAcceptablePrice?: string;
    userOrCallee?: string;
    calleeData?: string;
    calleeName?: string;
    error?: string;
}
