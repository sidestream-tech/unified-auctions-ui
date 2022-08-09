import getProvider from 'auctions-core/dist/src/provider';
import getContract, { getClipperNameByCollateralType } from 'auctions-core/dist/src/contracts';
import { Contract, EventFilter } from 'ethers';
import { fetchDateByBlockNumber } from 'auctions-core/dist/src/date';
import BigNumber from 'auctions-core/dist/src/bignumber';
import { RAY_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from 'auctions-core/dist/src/constants/UNITS';
import { getAllCollateralTypes } from 'auctions-core/dist/src/constants/COLLATERALS';
import cliProgress from 'cli-progress';
import { CollateralStats, EventData } from './types';
import { getCalleeNameByAddress } from 'auctions-core/dist/src/constants/CALLEES';
import { decodeCalleeData } from 'auctions-core/dist/src/calleeFunctions';
import { ARROW_EMOJI, DEBUG_MODE } from './variables';
import colors from 'ansi-colors';

const formatTransactionData = async function (
    network: string,
    collateralType: string,
    transaction: any,
    contract: Contract,
    dateLimit?: Date
): Promise<EventData | undefined> {
    const row: EventData = {
        collateralType,
        auctionId: undefined,
        transactionDate: undefined,
        minProfit: undefined,
        blockNumber: transaction.blockNumber,
        hash: transaction.hash,
        from: transaction.from,
        profitAddress: undefined,
        takenAmount: undefined,
        maxAcceptablePrice: '',
        userOrCallee: '',
        calleeData: undefined,
        calleeName: undefined,
        error: '',
    };

    // Get and check Date
    if (transaction.blockNumber) {
        const blockDate = await fetchDateByBlockNumber(network, transaction.blockNumber);
        const date = new Date(blockDate);
        if (dateLimit && dateLimit > date) {
            return;
        }
        row.transactionDate = blockDate;
    } else {
        row.transactionDate = 'no block number';
        if (dateLimit) {
            return;
        }
    }

    // Fetch take parameters
    let takeParameters;
    try {
        takeParameters = contract.interface.decodeFunctionData('take', transaction.data);
    } catch (error) {
        if (DEBUG_MODE) {
            console.error(error);
        }
        row.error = error as string;
        return row;
    }

    // Fetch callee name
    try {
        row.calleeName = getCalleeNameByAddress(network, takeParameters.who);
    } catch (error) {
        row.error = error as string;
    }

    // decode callee data
    if (takeParameters.data && row.calleeName) {
        try {
            const calleeData = decodeCalleeData(collateralType, takeParameters.data);
            if (calleeData) {
                row.minProfit = calleeData.minProfit.toNumber();
                row.profitAddress = calleeData.profitAddress;
            }
        } catch (error) {
            if (DEBUG_MODE) {
                console.error(error);
            }
            row.calleeData = takeParameters.data;
        }
    } else {
        row.calleeData = takeParameters.data;
    }

    return {
        ...row,
        auctionId: new BigNumber(takeParameters.id._hex).toFixed(),
        takenAmount: new BigNumber(takeParameters.amt._hex).shiftedBy(-WAD_NUMBER_OF_DIGITS).toFixed(),
        maxAcceptablePrice: new BigNumber(takeParameters.max._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS).toFixed(),
        userOrCallee: takeParameters.who,
        calleeData: takeParameters.data,
    };
};

const getTakeEventsByCollateralType = async function (
    network: string,
    collateralType: string,
    dateLimit?: Date
): Promise<{ rows: EventData[]; totalAuctions: number; totalAuctionsWithCallee: number }> {
    const provider = await getProvider(network);

    const contractName = getClipperNameByCollateralType(collateralType);
    const contract = await getContract(network, contractName);

    const eventFilters: EventFilter = contract.filters.Take();
    const allTakeEvents = await contract.queryFilter(eventFilters);

    const transactions = await Promise.all(allTakeEvents.map(e => provider.getTransaction(e.transactionHash)));

    const rows: any = [];
    let totalAuctionsWithCallee = 0;

    for (const transaction of transactions) {
        const formattedRow = await formatTransactionData(network, collateralType, transaction, contract, dateLimit);
        if (formattedRow) {
            if (formattedRow.calleeName) {
                totalAuctionsWithCallee++;
            }
            rows.push(formattedRow);
        }
    }
    return {
        rows,
        totalAuctions: transactions.length,
        totalAuctionsWithCallee,
    };
};

export const getEventDataFromCollaterals = async function (
    network: string,
    progressBar: cliProgress.SingleBar,
    dateLimit?: Date
): Promise<{ eventData: EventData[]; errors: string[]; collateralStats: Record<string, CollateralStats> }> {
    const collateralTypes = getAllCollateralTypes();

    let allRows: EventData[] = [];
    let errors: string[] = [];
    const collateralStats: Record<string, CollateralStats> = {};

    progressBar.start(collateralTypes.length, 0);

    for (const collateralType of collateralTypes) {
        try {
            const takeEvents = await getTakeEventsByCollateralType(network, collateralType, dateLimit);
            allRows = [...allRows, ...takeEvents.rows];
            collateralStats[collateralType] = {
                totalAuctions: takeEvents.totalAuctions,
                totalAuctionsWithCallee: takeEvents.totalAuctionsWithCallee,
            };
        } catch (error) {
            errors = [...errors, `[${collateralType}] ${error}`];
        } finally {
            progressBar.update(collateralTypes.indexOf(collateralType) + 1);
        }
    }

    return { eventData: allRows, errors: errors, collateralStats };
};

export const generateCollateralStatsMessage = function (
    collateralStats: Record<string, CollateralStats>,
    startDate?: Date
) {
    const totalAuctions = Object.values(collateralStats)
        .map(element => element.totalAuctions)
        .reduce((a, b) => a + b, 0);
    const totalAuctionsWithCallee = Object.values(collateralStats)
        .map(element => element.totalAuctionsWithCallee)
        .reduce((a, b) => a + b, 0);
    const sortedCollaterals = Object.keys(collateralStats).sort(function (a, b) {
        return collateralStats[b].totalAuctions - collateralStats[a].totalAuctions;
    });

    return `\n\n${ARROW_EMOJI}Since ${
        startDate ? startDate.toDateString() : 'the beginning'
    } there have been a total of ${colors.bold(totalAuctions.toFixed())} auction${
        totalAuctions === 1 ? '' : 's'
    }, ${colors.bold(
        totalAuctionsWithCallee.toFixed()
    )} of which had a callee.\n  The three most used collaterals were ${sortedCollaterals[0]} [${
        collateralStats[sortedCollaterals[0]].totalAuctions
    }], ${sortedCollaterals[1]} [${collateralStats[sortedCollaterals[1]].totalAuctions}] and ${
        sortedCollaterals[2]
    } [${collateralStats[sortedCollaterals[2]].totalAuctions}].`;
};
