export interface TickerOverview {
    snapshotDate: string;
    symbol: string;
    sectorKey: string;
    industryKey: string;
    exDividendDateUtc: string;
    longName: string;
    currentPrice: number;
    dividendRate: number;
    dividendYield: number;
    marketCap: number;
    payoutRatio: number;
    ttmDivs: number;
}

export interface Position {
    symbol: string;
    quantity: number;
}

export interface PositionOverview {
    position: Position;
    ttmDivs: number;
}
