import { setTimeout as delay } from 'timers/promises';
import { utils, writeFile } from 'xlsx';
import BigNumber from 'auctions-core/src//bignumber';
import { getNetworkConfigByType } from 'auctions-core/src/constants/NETWORKS';
import { getCalleeNameByAddress } from 'auctions-core/src/constants/CALLEES';
import { RAY_NUMBER_OF_DIGITS, WAD_NUMBER_OF_DIGITS } from 'auctions-core/src/constants/UNITS';
import COLLATERALS, { getCollateralConfigByType } from 'auctions-core/src/constants/COLLATERALS';
import getProvider from 'auctions-core/src/provider';
import getContract, { getClipperNameByCollateralType } from 'auctions-core/src/contracts';
import { fetchDateByBlockNumber } from 'auctions-core/src/date';
import { EventFilter, Event } from 'ethers';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { getMarketPrice } from 'auctions-core/src/calleeFunctions/index';

const NETWORK = 'localhost';
const SETUP_DELAY = 3 * 1000;

interface EventWithTransaction {
    transaction: TransactionResponse;
    event: Event;
}

const trimError = function (errorMessage: string | undefined): string {
    if (typeof errorMessage !== 'string') {
        return '';
    }
    return errorMessage.split('(', 2)[0];
};

const getTakeEvents = async function (network: string, collateralType: string): Promise<any> {
    const provider = await getProvider(network);

    const contractName = getClipperNameByCollateralType(collateralType);
    const contract = await getContract(network, contractName);

    const eventFilters: EventFilter = contract.filters.Take();

    const allTakeEvents = await contract.queryFilter(eventFilters);
    const eventsWithTransactions: EventWithTransaction[] = await Promise.all(
        allTakeEvents.map(async event => {
            const transaction = await provider.getTransaction(event.transactionHash);
            return {
                event,
                transaction,
            };
        })
    );

    const rows: any = [];

    for (const eventWithTransaction of eventsWithTransactions) {
        const transaction = eventWithTransaction.transaction;
        const row = {
            transactionDate: '' as any,
            blockNumber: transaction.blockNumber,
            collateralType,
            hash: transaction.hash,
            from: transaction.from,
            error: '',
            auctionId: '',
            takenAmount: '',
            maxAcceptablePrice: '',
            userOrCallee: '',
            calleeData: '',
            calleeName: '',
            marketPrice: '',
            price: '',
        };

        if (transaction.blockNumber) {
            row.transactionDate = await fetchDateByBlockNumber(network, transaction.blockNumber);
        } else {
            row.transactionDate = 'no block number';
        }

        let takeParameters;
        try {
            takeParameters = contract.interface.decodeFunctionData('take', transaction.data);
        } catch (error: any) {
            console.info('decodeFunctionData error:', trimError(error.message));
            row.error = trimError(error.message);
            rows.push(row);
            continue;
        }

        let calleeName;
        try {
            calleeName = getCalleeNameByAddress(network, takeParameters.who);
        } catch (error: any) {
            row.error = trimError(error.message);
        }

        const collateralSymbol = getCollateralConfigByType(collateralType).symbol;
        let marketPrice;
        try {
            marketPrice = await getMarketPrice(NETWORK, collateralSymbol, new BigNumber(1));
        } catch (error) {
            console.info(`cannot fetch market price for the collateral ${collateralSymbol} due to ${error}`);
        }

        rows.push({
            ...row,
            auctionId: new BigNumber(takeParameters.id._hex).toFixed(),
            takenAmount: new BigNumber(takeParameters.amt._hex).shiftedBy(-WAD_NUMBER_OF_DIGITS).toFixed(),
            maxAcceptablePrice: new BigNumber(takeParameters.max._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS).toFixed(),
            userOrCallee: takeParameters.who,
            calleeData: takeParameters.data,
            calleeName,
            price: new BigNumber(eventWithTransaction.event.args?.price._hex)
                .shiftedBy(-RAY_NUMBER_OF_DIGITS)
                .toFixed(),
            marketPrice: marketPrice ? marketPrice.toString() : '',
        });
    }
    return rows;
};

const start = async function (): Promise<void> {
    await delay(SETUP_DELAY);
    getNetworkConfigByType(NETWORK);

    const workbook = utils.book_new();
    let allRows: any = [];
    const collateralTypes = Object.keys(COLLATERALS);
    // collateralTypes = collateralTypes.slice(0, 2);
    for (const collateralType of collateralTypes) {
        try {
            console.info(`extracting events of the collateralType ${collateralType}`);
            const rows = await getTakeEvents(NETWORK, collateralType);
            console.info(`extracted "${rows.length}" events of the collateralType ${collateralType}`);
            allRows = [...allRows, ...rows];
        } catch (error: any) {
            console.error(`collateral ${collateralType} processing failed`, error.message);
        }
    }
    const worksheet = utils.json_to_sheet(allRows);
    utils.book_append_sheet(workbook, worksheet, 'transactions');
    const timestamp = Date.now();
    const filename = `bidding-transactions-export-${timestamp}.xlsx`;
    writeFile(workbook, filename);
    console.info(`finished writing to file ${filename}`);
};

start().catch(error => {
    throw error;
});

export default function () {} // required by nuxt
