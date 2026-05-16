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
