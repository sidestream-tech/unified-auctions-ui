import truncateText from './truncateText';

const removeSpecialCharacters = function (text = '') {
    return text.replace(/['\{\}\\"]/gm, '').replace(/\[.+\]/gm, '');
};

const getErrorDetails = function (errorMessage = '') {
    // Get useful content between `"message":"` and `"`
    const START_SYMBOLS = '"message":"';
    const STOP_SYMBOLS = '"';
    const jsonFirstIndex = errorMessage.indexOf(START_SYMBOLS);
    if (jsonFirstIndex === -1) {
        return '';
    }
    const messageStartIndex = jsonFirstIndex + START_SYMBOLS.length;
    const messageStopIndex = errorMessage.indexOf(STOP_SYMBOLS, messageStartIndex);
    const extractedContent = errorMessage.substring(messageStartIndex, messageStopIndex);
    return removeSpecialCharacters(extractedContent);
};

const getErrorTitle = function (errorMessage = '') {
    // Get useful content before code starts
    const jsonStartIndex = errorMessage.search(/[\(\{]/gm);
    if (jsonStartIndex === -1) {
        return '';
    }
    return errorMessage.substring(0, jsonStartIndex).trim();
};

const parseMetamaskError = function (errorMessage = ''): unknown {
    const errorTitle = getErrorTitle(errorMessage);
    if (!errorTitle) {
        return truncateText(errorMessage || 'Unknown error').trim();
    }
    const errorDetails = getErrorDetails(errorMessage);
    if (!errorDetails) {
        return errorTitle;
    }
    return `${errorDetails} (${errorTitle})`;
};

export default parseMetamaskError;
