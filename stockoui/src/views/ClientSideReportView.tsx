import { useEffect, useMemo, useState } from 'react';
import { currencyFormatter } from '../lib/format';
import type { Position, TickerOverview } from './types';

const reportPositions: Position[] = [
    { symbol: 'BNS.TO', quantity: 100 },
    { symbol: 'TD.TO', quantity: 50 },
];

function ClientSideReportView() {
    const [tickers, setTickers] = useState<TickerOverview[]>();

    useEffect(() => {
        if (tickers === undefined) {
            populateDatastoreData();
        }
    }, [tickers]);

    const rows = useMemo(() => {
        if (tickers === undefined) return undefined;
        const bySymbol = new Map(tickers.map(t => [t.symbol, t]));
        return reportPositions
            .map(p => {
                const ticker = bySymbol.get(p.symbol);
                if (ticker === undefined) return undefined;
                return {
                    ticker,
                    quantity: p.quantity,
                    positionValue: ticker.currentPrice * p.quantity,
                    positionFwdDividend: ticker.dividendRate * p.quantity,
                    positionTtmDividend: ticker.ttmDivs * p.quantity,
                };
            })
            .filter((r): r is NonNullable<typeof r> => r !== undefined);
    }, [tickers]);

    const portfolioTotals = useMemo(() => {
        if (rows === undefined) return undefined;
        return rows.reduce(
            (acc, r) => ({
                value: acc.value + r.positionValue,
                fwdDividend: acc.fwdDividend + r.positionFwdDividend,
                ttmDividend: acc.ttmDividend + r.positionTtmDividend,
            }),
            { value: 0, fwdDividend: 0, ttmDividend: 0 },
        );
    }, [rows]);

    const allocations = useMemo(() => {
        if (rows === undefined || portfolioTotals === undefined || portfolioTotals.value === 0) return undefined;
        const bySector = new Map<string, { value: number; industries: Map<string, number> }>();
        for (const row of rows) {
            const sectorKey = row.ticker.sectorKey;
            const industryKey = row.ticker.industryKey;
            let sector = bySector.get(sectorKey);
            if (sector === undefined) {
                sector = { value: 0, industries: new Map() };
                bySector.set(sectorKey, sector);
            }
            sector.value += row.positionValue;
            sector.industries.set(
                industryKey,
                (sector.industries.get(industryKey) ?? 0) + row.positionValue,
            );
        }
        return Array.from(bySector, ([sectorKey, sector]) => ({
            key: sectorKey,
            allocation: sector.value / portfolioTotals.value,
            industries: Array.from(sector.industries, ([industryKey, value]) => ({
                key: industryKey,
                allocation: value / portfolioTotals.value,
            })),
        }));
    }, [rows, portfolioTotals]);

    const totalIndustryRows = allocations === undefined
        ? 0
        : allocations.reduce((sum, s) => sum + s.industries.length, 0);

    const contents = rows === undefined || portfolioTotals === undefined || allocations === undefined
        ? <p><em>Loading...</em></p>
        : <>
            <table className="table table-striped" aria-label="Portfolio Totals">
                <thead>
                    <tr>
                        <th></th>
                        <th>Value</th>
                        <th>FwdDividend</th>
                        <th>TtmDividend</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">Portfolio Totals</th>
                        <td>{currencyFormatter.format(portfolioTotals.value)}</td>
                        <td>{currencyFormatter.format(portfolioTotals.fwdDividend)}</td>
                        <td>{currencyFormatter.format(portfolioTotals.ttmDividend)}</td>
                    </tr>
                </tbody>
            </table>
            <table className="table table-striped" aria-label="Portfolio Allocations">
                <thead>
                    <tr>
                        <th></th>
                        <th>Sector</th>
                        <th>Allocation</th>
                        <th>Industry</th>
                        <th>Allocation</th>
                    </tr>
                </thead>
                <tbody>
                    {allocations.flatMap((sector, sectorIdx) =>
                        sector.industries.map((industry, industryIdx) => (
                            <tr key={`${sector.key}|${industry.key}`}>
                                {sectorIdx === 0 && industryIdx === 0 && (
                                    <th scope="row" rowSpan={totalIndustryRows}>Portfolio Allocations</th>
                                )}
                                {industryIdx === 0 && (
                                    <>
                                        <td rowSpan={sector.industries.length}>{sector.key}</td>
                                        <td rowSpan={sector.industries.length}>{(sector.allocation * 100).toFixed(2)}%</td>
                                    </>
                                )}
                                <td>{industry.key}</td>
                                <td>{(industry.allocation * 100).toFixed(2)}%</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <table className="table table-striped" aria-labelledby="clientSideReportTableLabel">
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Sector</th>
                    <th>Industry</th>
                    <th>Snapshot</th>
                    <th>Ex-Div</th>
                    <th>Price</th>
                    <th>Div Rate</th>
                    <th>Div Yield</th>
                    <th>Market Cap</th>
                    <th>Payout Ratio</th>
                    <th>TtmDivs</th>
                    <th>Quantity</th>
                    <th>Position Value</th>
                    <th>Position FwdDividend</th>
                    <th>Position TtmDividend</th>
                </tr>
            </thead>
            <tbody>
                {rows.map(row =>
                    <tr key={row.ticker.symbol}>
                        <td>{row.ticker.symbol}</td>
                        <td>{row.ticker.longName}</td>
                        <td>{row.ticker.sectorKey}</td>
                        <td>{row.ticker.industryKey}</td>
                        <td>{row.ticker.snapshotDate}</td>
                        <td>{row.ticker.exDividendDateUtc}</td>
                        <td>{currencyFormatter.format(row.ticker.currentPrice)}</td>
                        <td>{currencyFormatter.format(row.ticker.dividendRate)}</td>
                        <td>{(row.ticker.dividendYield * 100).toFixed(2)}%</td>
                        <td>{currencyFormatter.format(row.ticker.marketCap)}</td>
                        <td>{(row.ticker.payoutRatio * 100).toFixed(2)}%</td>
                        <td>{currencyFormatter.format(row.ticker.ttmDivs)}</td>
                        <td>{row.quantity}</td>
                        <td>{currencyFormatter.format(row.positionValue)}</td>
                        <td>{currencyFormatter.format(row.positionFwdDividend)}</td>
                        <td>{currencyFormatter.format(row.positionTtmDividend)}</td>
                    </tr>
                )}
            </tbody>
            </table>
        </>;

    return (
        <div className="client-side-report-view">
            <h1 id="clientSideReportTableLabel">Client-Side Report</h1>
            {contents}
        </div>
    );

    async function populateDatastoreData() {
        const response = await fetch('datastore/overview');
        if (response.ok) {
            const data = await response.json();
            setTickers(data);
        }
    }
}

export default ClientSideReportView;
