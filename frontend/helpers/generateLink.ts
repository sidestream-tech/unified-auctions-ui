export const generateLink = function (network?: string, link?: string): string {
    const networkAddon = network ? `?network=${network}` : undefined;

    return `/${link}${networkAddon || ''}`;
};
