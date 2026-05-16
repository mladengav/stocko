import { useEffect, useMemo, useState } from 'react';
import { currencyFormatter, formatMarketCap } from '../lib/format';
import PortfolioAllocations from './PortfolioAllocations';
import type { Position, TickerOverview } from './types';

const reportPositions: Position[] = [
    { symbol: "BCE.TO", quantity: 50 },
    { symbol: "CAS.TO", quantity: 100 },
    { symbol: "CGO.TO", quantity: 125 },
    { symbol: "CM.TO", quantity: 20 },
    { symbol: "CNQ.TO", quantity: 100 },
    { symbol: "CPX.TO", quantity: 100 },
    { symbol: "CTC-A.TO", quantity: 10 },
    { symbol: "CU.TO", quantity: 300 },
    { symbol: "CVE.TO", quantity: 80 },
    { symbol: "EMA.TO", quantity: 50 },
    { symbol: "ENB.TO", quantity: 190 },
    { symbol: "FTS.TO", quantity: 50 },
    { symbol: "PPL.TO", quantity: 50 },
    { symbol: "SLF.TO", quantity: 90 },
    { symbol: "SOBO.TO", quantity: 50 },
    { symbol: "T.TO", quantity: 100 },
    { symbol: "TD.TO", quantity: 20 },
    { symbol: "TRP.TO", quantity: 100 },
    { symbol: "WTE.TO", quantity: 90 }
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

    const contents = rows === undefined || portfolioTotals === undefined || portfolioTotals.value === 0
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
            <PortfolioAllocations
                rows={rows}
                portfolioValue={portfolioTotals.value}
                portfolioFwdDividend={portfolioTotals.fwdDividend}
            />
            <table className="table table-striped" aria-labelledby="clientSideReportTableLabel">
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Position Value</th>
                    <th>Div Rate</th>
                    <th>Position FwdDividend</th>
                    <th>TtmDivs</th>
                    <th>Position TtmDividend</th>
                    <th>Sector</th>
                    <th>Industry</th>
                    <th>Snapshot</th>
                    <th>Ex-Div</th>
                    <th>Div Rate</th>
                    <th>Div Yield</th>
                    <th>Market Cap</th>
                    <th>Payout Ratio</th>
                </tr>
            </thead>
            <tbody>
                {rows.map(row =>
                    <tr key={row.ticker.symbol}>
                        <td>{row.ticker.symbol}</td>
                        <td>{row.ticker.longName}</td>
                        <td>{currencyFormatter.format(row.ticker.currentPrice)}</td>
                        <td>{row.quantity}</td>
                        <td>{currencyFormatter.format(row.positionValue)}</td>
                        <td>{currencyFormatter.format(row.ticker.dividendRate)}</td>
                        <td>{currencyFormatter.format(row.positionFwdDividend)}</td>
                        <td>{currencyFormatter.format(row.ticker.ttmDivs)}</td>
                        <td>{currencyFormatter.format(row.positionTtmDividend)}</td>
                        <td>{row.ticker.sectorKey}</td>
                        <td>{row.ticker.industryKey}</td>
                        <td>{row.ticker.snapshotDate}</td>
                        <td>{row.ticker.exDividendDateUtc}</td>
                        <td>{currencyFormatter.format(row.ticker.dividendRate)}</td>
                        <td>{(row.ticker.dividendYield).toFixed(2)}%</td>
                        <td>{formatMarketCap(row.ticker.marketCap)}</td>
                        <td>{(row.ticker.payoutRatio * 100).toFixed(2)}%</td>
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
