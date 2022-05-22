import truncateText from './truncateText';

const parseMetamaskError = function (errorMessage = ''): unknown {
    const splitError = errorMessage.split('(')[0];
    return truncateText(splitError);
};

export default parseMetamaskError;
