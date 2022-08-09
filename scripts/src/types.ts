export interface EventData {
    collateralType: string;
    auctionId?: string;
    transactionDate?: string | Date;
    minProfit?: number;
    blockNumber?: number;
    hash: string;
    from: string;
    profitAddress?: string;
    takenAmount?: string;
    maxAcceptablePrice?: string;
    userOrCallee?: string;
    calleeData?: string;
    calleeName?: string;
    error?: string;
}

export interface CollateralStats {
    totalAuctions: number;
    totalTakenViaSAS: number;
}
