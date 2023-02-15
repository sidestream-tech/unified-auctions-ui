const compareVersions = (v1, v2) => {
    const v1Numbers = v1.split('.').map(Number);
    const v2Numbers = v2.split('.').map(Number);
    const maxArrayLength = Math.max(v1Numbers.length, v2Numbers.length);

    for (let i = 0; i < maxArrayLength; i++) {
        const v1Part = i < v1Numbers.length ? v1Numbers[i] : 0;
        const v2Part = i < v2Numbers.length ? v2Numbers[i] : 0;

        if (v1Part > v2Part) {
            return 1;
        }

        if (v1Part < v2Part) {
            return -1;
        }
    }

    return 0;
};

module.exports = { compareVersions };
