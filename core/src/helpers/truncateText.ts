const truncateText = function (text: string, maxLength = 100) {
    if (text.length > maxLength) {
        return `${text.substring(0, maxLength).trim()}...`;
    }
    return text;
};

export default truncateText;
