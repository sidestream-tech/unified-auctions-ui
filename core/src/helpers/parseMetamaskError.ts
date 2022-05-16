import METAMASK_ERRORS from '../constants/METAMASK_ERRORS';
import truncateText from './truncateText';

const parseMetamaskError = function (errorMessage = ''): string {
    const jsonFirstIndex = errorMessage.indexOf('{');
    const jsonLastIndex = errorMessage.lastIndexOf('}');
    try {
        const jsonString = errorMessage.substring(jsonFirstIndex, jsonLastIndex + 1);
        const metamaskError = JSON.parse(jsonString);

        const rawErrorMessage = metamaskError?.value?.data?.message || 'unknown';
        const parsedErrorMessage = METAMASK_ERRORS[rawErrorMessage] || rawErrorMessage;

        return truncateText(parsedErrorMessage);
    } catch {
        const rawErrorMessage = errorMessage || 'unknown';
        const parsedErrorMessage = METAMASK_ERRORS[rawErrorMessage] || rawErrorMessage;

        return truncateText(parsedErrorMessage);
    }
};

export default parseMetamaskError;
