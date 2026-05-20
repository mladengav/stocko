export const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD',
});

/** Whole millions under $1B (e.g. CA$200M); one decimal billion at/above $1B (e.g. CA$1.2B). */
export function formatMarketCap(value: number): string {
    const cad = (amount: number, minFd: number, maxFd: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: minFd,
            maximumFractionDigits: maxFd,
        }).format(amount);

    if (Math.abs(value) >= 1e9) {
        const billions = value / 1e9;
        const rounded = Math.round(billions * 10) / 10;
        const minFd = Number.isInteger(rounded) ? 0 : 1;
        return `${cad(rounded, minFd, 1)}B`;
    }
    const millions = Math.round(value / 1e6);
    return `${cad(millions, 0, 0)}M`;
}

export function formatEpochSeconds(epochSeconds: number): string {
    return epochSeconds === 0 ? '' : new Date(epochSeconds * 1000).toLocaleString();
}

export function formatFractionAsPercent(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
}

/** Drop a leading sector prefix and following punctuation from industry labels. */
export function formatIndustryLabel(sector: string, industry: string): string {
    if (!sector || !industry.startsWith(sector)) {
        return industry;
    }
    const trimmed = industry.slice(sector.length).replace(/^[^a-zA-Z0-9]+/, '');
    return trimmed || industry;
}
