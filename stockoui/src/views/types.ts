export interface TickerOverview {
    snapshotDate: string;
    symbol: string;
    sectorKey: string;
    industryKey: string;
    industry: string;
    sector: string;
    exDividendDate: string;
    lastDividendDate: string;
    longName: string;
    regularMarketPrice: number;
    regularMarketTime: number;
    dividendRate: number;
    dividendYield: number;
    marketCap: number;
    payoutRatio: number;
    heldPercentInsiders: number;
    heldPercentInstitutions: number;
    quoteType: string;
    typeDisp: string;
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
