import truncateText from './truncateText';

const ERROR_MESSAGE_START_KEYWORD = '"message":"';

const parseMetamaskError = function (errorMessage = ''): unknown {
    const jsonFirstIndex = errorMessage.indexOf(ERROR_MESSAGE_START_KEYWORD);
    if (jsonFirstIndex === -1) {
        return truncateText(errorMessage || 'unknown');
    }
    try {
        const firstTrim = errorMessage.substring(jsonFirstIndex + ERROR_MESSAGE_START_KEYWORD.length);
        const jsonLastIndex = firstTrim.indexOf('"');
        const trimmedErrorMessage = firstTrim
            .substring(0, jsonLastIndex)
            .replace("'", '')
            .replace('}', '')
            .replace('{', '')
            .replace('\\', '');
        return truncateText(trimmedErrorMessage || 'unknown');
    } catch {
        return truncateText(errorMessage || 'unknown');
    }
};

export default parseMetamaskError;
