import truncateText from './truncateText';

const parseMetamaskError = function (errorMessage = ''): string {
    const jsonFirstIndex = errorMessage.indexOf('{');
    const jsonLastIndex = errorMessage.lastIndexOf('}');
    try {
        const jsonString = errorMessage.substring(jsonFirstIndex, jsonLastIndex + 1);
        const metamaskError = JSON.parse(jsonString);
        return truncateText(metamaskError?.value?.data?.message || 'unknown');
    } catch {
        return truncateText(errorMessage || 'unknown');
    }
};

export default parseMetamaskError;
