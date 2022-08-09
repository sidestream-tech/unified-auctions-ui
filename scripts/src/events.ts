import getProvider from 'auctions-core/dist/src/provider';
import getContract, { getClipperNameByCollateralType } from 'auctions-core/dist/src/contracts';
import { EventFilter } from 'ethers';
import { utils, writeFile } from 'xlsx';
import { fetchDateByBlockNumber } from 'auctions-core/dist/src/date';
import BigNumber from 'auctions-core/dist/src/bignumber';
import { WAD_NUMBER_OF_DIGITS, RAY_NUMBER_OF_DIGITS } from 'auctions-core/dist/src/constants/UNITS';
import { getAllCollateralTypes } from 'auctions-core/dist/src/constants/COLLATERALS';
import cliProgress from 'cli-progress';

const trimError = function (errorMessage: string | undefined): string {
    if (typeof errorMessage !== 'string') {
        return '';
    }
    return errorMessage.split('(', 2)[0];
};

const getTakeEvents = async function (network: string, collateralType: string, dateLimit?: Date): Promise<any> {
    const provider = await getProvider(network);

    const contractName = getClipperNameByCollateralType(collateralType);
    const contract = await getContract(network, contractName);

    const eventFilters: EventFilter = contract.filters.Take();
    const allTakeEvents = await contract.queryFilter(eventFilters);

    const transactions = await Promise.all(allTakeEvents.map(e => provider.getTransaction(e.transactionHash)));

    const rows: any = [];

    for (const transaction of transactions) {
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
        };

        if (transaction.blockNumber) {
            const blockDate = await fetchDateByBlockNumber(network, transaction.blockNumber);
            const date = new Date(blockDate);
            if (dateLimit && dateLimit.getMilliseconds() > date.getMilliseconds()) {
                continue;
            }
            row.transactionDate = blockDate;
        } else {
            row.transactionDate = 'no block number';
            if (dateLimit) {
                continue;
            }
        }

        let takeParameters;
        try {
            takeParameters = contract.interface.decodeFunctionData('take', transaction.data);
        } catch (error) {
            console.info('decodeFunctionData error:', trimError(error.message));
            row.error = trimError(error.message);
            rows.push(row);
            continue;
        }

        rows.push({
            ...row,
            auctionId: new BigNumber(takeParameters.id._hex).toFixed(),
            takenAmount: new BigNumber(takeParameters.amt._hex).shiftedBy(-WAD_NUMBER_OF_DIGITS).toFixed(),
            maxAcceptablePrice: new BigNumber(takeParameters.max._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS).toFixed(),
            userOrCallee: takeParameters.who,
            calleeData: takeParameters.data,
        });
    }
    return rows;
};

export const start = async function (
    network: string,
    progressBar: cliProgress.SingleBar,
    dateLimit?: Date
): Promise<void> {
    const collateralTypes = getAllCollateralTypes();
    let allRows: any = [];
    const workbook = utils.book_new();

    progressBar.start(collateralTypes.length, 0);
    // collateralTypes = collateralTypes.slice(0, 2);
    for (const collateralType of collateralTypes) {
        try {
            const rows = await getTakeEvents(network, collateralType, dateLimit);
            allRows = [...allRows, ...rows];
        } catch (error) {
            console.error(`collateral ${collateralType} processing failed`, error.message);
        } finally {
            progressBar.update(collateralTypes.indexOf(collateralType) + 1);
        }
    }

    progressBar.stop();
    const worksheet = utils.json_to_sheet(allRows);
    utils.book_append_sheet(workbook, worksheet, 'transactions');
    const timestamp = Date.now();
    const filename = `bidding-transactions-export-${timestamp}.xlsx`;
    writeFile(workbook, filename);
    console.info(`finished.`);
};
