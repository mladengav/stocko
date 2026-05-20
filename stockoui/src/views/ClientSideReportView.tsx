import { useEffect, useMemo, useState } from 'react';
import { currencyFormatter, formatEpochSeconds, formatFractionAsPercent, formatIndustryLabel, formatMarketCap } from '../lib/format';
import PortfolioAllocations from './PortfolioAllocations';
import ReportInput from './ReportInput';
import type { Position, TickerOverview } from './types';

function ClientSideReportView() {
    const [reportPositions, setReportPositions] = useState<Position[]>();
    const [tickers, setTickers] = useState<TickerOverview[]>();

    useEffect(() => {
        if (reportPositions !== undefined && tickers === undefined) {
            populateDatastoreData();
        }
    }, [reportPositions, tickers]);

    const rows = useMemo(() => {
        if (tickers === undefined || reportPositions === undefined) return undefined;
        const bySymbol = new Map(tickers.map(t => [t.symbol, t]));
        return reportPositions
            .map(p => {
                const ticker = bySymbol.get(p.symbol);
                if (ticker === undefined) return undefined;
                return {
                    ticker,
                    quantity: p.quantity,
                    positionValue: ticker.regularMarketPrice * p.quantity,
                    positionFwdDividend: ticker.dividendRate * p.quantity,
                    positionTtmDividend: ticker.ttmDivs * p.quantity,
                };
            })
            .filter((r): r is NonNullable<typeof r> => r !== undefined);
    }, [tickers, reportPositions]);

    const ignoredSymbols = useMemo(() => {
        if (reportPositions === undefined || tickers === undefined) return [];
        const supported = new Set(tickers.map(t => t.symbol));
        const ignored: string[] = [];
        const seen = new Set<string>();
        for (const { symbol } of reportPositions) {
            if (!supported.has(symbol) && !seen.has(symbol)) {
                seen.add(symbol);
                ignored.push(symbol);
            }
        }
        return ignored;
    }, [reportPositions, tickers]);

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


    //TODO:  Move to MUI datagrid:  https://mui.com/x/react-data-grid/
    const reportContents = tickers === undefined
        ? <p><em>Loading...</em></p>
        : rows === undefined || rows.length === 0
        ? <>
            {ignoredSymbols.length > 0 && (
                <p>
                    <em>
                        NOTE:  Some symbols from the input are not currently supported and have been ignored ({ignoredSymbols.join(',')})
                    </em>
                </p>
            )}
            <p><em>No positions matched symbols in the datastore. Check CSV symbols (e.g. BCE.TO).</em></p>
        </>
        : portfolioTotals === undefined
        ? <p><em>Loading...</em></p>
        : <>
            <ReportInput onPositionsLoaded={setReportPositions} />
            {ignoredSymbols.length > 0 && (
                <p>
                    <em>
                        NOTE:  Some symbols from the input are not currently supported and have been ignored ({ignoredSymbols.join(',')})
                    </em>
                </p>
            )}
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
                    <th>Last Div</th>
                    <th>Market Time</th>
                    <th>Div Yield</th>
                    <th>Market Cap</th>
                    <th>Payout Ratio</th>
                    <th>% Insiders</th>
                    <th>% Institutions</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                {rows.map(row =>
                    <tr key={row.ticker.symbol}>
                        <td>{row.ticker.symbol}</td>
                        <td>{row.ticker.longName}</td>
                        <td>{currencyFormatter.format(row.ticker.regularMarketPrice)}</td>
                        <td>{row.quantity}</td>
                        <td>{currencyFormatter.format(row.positionValue)}</td>
                        <td>{currencyFormatter.format(row.ticker.dividendRate)}</td>
                        <td>{currencyFormatter.format(row.positionFwdDividend)}</td>
                        <td>{currencyFormatter.format(row.ticker.ttmDivs)}</td>
                        <td>{currencyFormatter.format(row.positionTtmDividend)}</td>
                        <td>{row.ticker.sector}</td>
                        <td>{formatIndustryLabel(row.ticker.sector, row.ticker.industry)}</td>
                        <td>{row.ticker.snapshotDate}</td>
                        <td>{row.ticker.exDividendDate}</td>
                        <td>{row.ticker.lastDividendDate}</td>
                        <td>{formatEpochSeconds(row.ticker.regularMarketTime)}</td>
                        <td>{row.ticker.dividendYield.toFixed(2)}%</td>
                        <td>{formatMarketCap(row.ticker.marketCap)}</td>
                        <td>{formatFractionAsPercent(row.ticker.payoutRatio)}</td>
                        <td>{formatFractionAsPercent(row.ticker.heldPercentInsiders)}</td>
                        <td>{formatFractionAsPercent(row.ticker.heldPercentInstitutions)}</td>
                        <td>{row.ticker.typeDisp}</td>
                    </tr>
                )}
            </tbody>
            </table>
        </>;

    return (
        <div className="client-side-report-view">
            <h1 id="clientSideReportTableLabel">Client-Side Report</h1>
            {reportPositions === undefined
                ? <ReportInput onPositionsLoaded={setReportPositions} />
                : reportContents}
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
