import truncateText from './truncateText';

const parseMetamaskError = function (errorMessage = ''): unknown {
    const jsonFirstIndex = errorMessage.indexOf('"message":');
    const jsonLastIndex = errorMessage.lastIndexOf('"stack":');
    const jsonString = `{${errorMessage.substring(jsonFirstIndex, jsonLastIndex - 1)}}`;

    const messageFirstIndex = jsonString.indexOf("'{");
    const messageLastIndex = jsonString.lastIndexOf("}'");

    const messageJsonString = `${jsonString.substring(messageFirstIndex + 1, messageLastIndex)}}`;

    console.log(messageJsonString)
    const metamaskError = JSON.parse(messageJsonString);
    return truncateText(metamaskError?.value?.data?.message || 'unknown');
};

export default parseMetamaskError;
