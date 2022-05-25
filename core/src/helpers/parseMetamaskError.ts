import truncateText from './truncateText';

const parseMetamaskError = function (errorMessage = ''): unknown {
    const jsonFirstIndex = errorMessage.indexOf('"message":"');
    if (jsonFirstIndex === -1) {
        return truncateText(errorMessage || 'unknown');
    }
    try {
        const firstTrim = errorMessage.substring(jsonFirstIndex + 11);
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
