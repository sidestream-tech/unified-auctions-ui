import colors from 'ansi-colors';
import { utils, WorkSheet, writeFile } from 'xlsx';
import { CollateralStats, EventData } from './types';
import { CHECK_EMOJI, FOLDER_EMOJI } from './variables';

const createTransactionWorkSheet = function (eventData: EventData[]): WorkSheet {
    return utils.json_to_sheet(eventData);
};

const createCollateralWorkSheet = function (collateralData: Record<string, CollateralStats>): WorkSheet {
    const collaterals = Object.values(collateralData).map((collateral, index) => {
        return {
            collateralType: Object.keys(collateralData)[index],
            ...collateral,
        };
    });

    return utils.json_to_sheet(collaterals);
};

export const createAndExportSheet = function (
    eventData: EventData[],
    collateralData: Record<string, CollateralStats>,
    customFileName?: string
) {
    const workbook = utils.book_new();

    const collateralWorkSheet = createCollateralWorkSheet(collateralData);
    const transactionsWorkSheet = createTransactionWorkSheet(eventData);

    utils.book_append_sheet(workbook, collateralWorkSheet, 'Collaterals');
    utils.book_append_sheet(workbook, transactionsWorkSheet, 'Transactions');

    const timestamp = Date.now();
    const filename = (customFileName || `bidding-transactions-export-${timestamp}`) + '.xlsx';
    writeFile(workbook, filename);

    console.info(`\n\n${colors.green(CHECK_EMOJI)}${FOLDER_EMOJI} Successfully exported the data to "${filename}"`);
    process.exit(1);
};
