import getProvider from 'auctions-core/dist/src/provider';
import getContract, { getClipperNameByCollateralType } from 'auctions-core/dist/src/contracts';
import { Contract, EventFilter } from 'ethers';
import { fetchDateByBlockNumber } from 'auctions-core/dist/src/date';
import BigNumber from 'auctions-core/dist/src/bignumber';
import { WAD_NUMBER_OF_DIGITS, RAY_NUMBER_OF_DIGITS } from 'auctions-core/dist/src/constants/UNITS';
import { getAllCollateralTypes } from 'auctions-core/dist/src/constants/COLLATERALS';
import cliProgress from 'cli-progress';
import { EventData } from './types';
import { getCalleeNameByAddress } from 'auctions-core/dist/src/constants/CALLEES';

const trimError = function (errorMessage: string | undefined): string {
    if (typeof errorMessage !== 'string') {
        return '';
    }
    return errorMessage.split('(', 2)[0];
};

const formatTransactionData = async function (
    network: string,
    collateralType: string,
    transaction: any,
    contract: Contract,
    dateLimit?: Date
): Promise<EventData | undefined> {
    const row: EventData = {
        collateralType,
        blockNumber: transaction.blockNumber,
        hash: transaction.hash,
        from: transaction.from,
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
        console.info('\ndecodeFunctionData error:', trimError(error.message));
        row.error = trimError(error.message);
        return row;
    }

    // Fetch callee name
    try {
        row.calleeName = getCalleeNameByAddress(network, takeParameters.who);
    } catch (error) {
        row.error = trimError(error.message);
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
): Promise<any> {
    const provider = await getProvider(network);

    const contractName = getClipperNameByCollateralType(collateralType);
    const contract = await getContract(network, contractName);

    const eventFilters: EventFilter = contract.filters.Take();
    const allTakeEvents = await contract.queryFilter(eventFilters);

    const transactions = await Promise.all(allTakeEvents.map(e => provider.getTransaction(e.transactionHash)));

    const rows: any = [];

    for (const transaction of transactions) {
        const formattedRow = await formatTransactionData(network, collateralType, transaction, contract, dateLimit);
        if (formattedRow) {
            rows.push(formattedRow);
        }
    }
    return rows;
};

export const getEventDataFromCollaterals = async function (
    network: string,
    progressBar: cliProgress.SingleBar,
    dateLimit?: Date
): Promise<{ eventData: EventData[]; errors: string[] }> {
    const collateralTypes = getAllCollateralTypes();
    let allRows: EventData[] = [];
    let errors: string[] = [];

    progressBar.start(collateralTypes.length, 0);

    for (const collateralType of collateralTypes) {
        try {
            const rows = await getTakeEventsByCollateralType(network, collateralType, dateLimit);
            allRows = [...allRows, ...rows];
        } catch (error) {
            errors = [...errors, `[${collateralType}] ${error.message}`];
        } finally {
            progressBar.update(collateralTypes.indexOf(collateralType) + 1);
        }
    }

    return { eventData: allRows, errors: errors };
};
