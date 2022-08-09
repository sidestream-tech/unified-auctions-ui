import colors from 'ansi-colors';
import { utils, writeFile } from 'xlsx';
import { EventData } from './types';
import { CHECK_EMOJI, FOLDER_EMOJI } from './variables';

export const createAndExportSheet = function (eventData: EventData[], customFileName?: string) {
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(eventData);
    utils.book_append_sheet(workbook, worksheet, 'transactions');

    const timestamp = Date.now();
    const filename = (customFileName || `bidding-transactions-export-${timestamp}`) + '.xlsx';
    writeFile(workbook, filename);

    console.info(`\n\n${colors.green(CHECK_EMOJI)}${FOLDER_EMOJI} Successfully exported the data to "${filename}"`);
    process.exit(1);
};
