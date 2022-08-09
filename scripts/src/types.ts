export interface EventData {
    collateralType: string;
    auctionId?: string;
    transactionDate?: string | Date;
    blockNumber?: number;
    hash: string;
    from: string;
    takenAmount?: string;
    maxAcceptablePrice?: string;
    userOrCallee?: string;
    calleeData?: string;
    calleeName?: string;
    error?: string;
}
