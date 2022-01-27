export const shortenMiddle = (str: string): string => {
    if (str.length < 10) return str;
    return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
};

export const shortenEnd = (str: string): string => {
    if (str.length < 5) return str;
    return `${str.slice(0, 6)}`;
};

export const shortenPercentage = (str: string): string => {
    if (str.length < 4) return str;
    return `${str.slice(0, 5)}`;
};
