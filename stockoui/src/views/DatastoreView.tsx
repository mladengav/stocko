import { useEffect, useState } from 'react';
import { currencyFormatter, formatEpochSeconds, formatFractionAsPercent, formatIndustryLabel, formatMarketCap } from '../lib/format';
import type { TickerOverview } from './types';

function DatastoreView() {
    const [tickers, setTickers] = useState<TickerOverview[]>();

    useEffect(() => {
        if (tickers === undefined) {
            populateDatastoreData();
        }
    }, [tickers]);

    const contents = tickers === undefined
        ? <p><em>Loading...</em></p>
        : <table className="table table-striped" aria-labelledby="datastoreTableLabel">
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Sector</th>
                    <th>Industry</th>
                    <th>Snapshot</th>
                    <th>Ex-Div</th>
                    <th>Last Div</th>
                    <th>Market Time</th>
                    <th>Price</th>
                    <th>Div Rate</th>
                    <th>Div Yield</th>
                    <th>Market Cap</th>
                    <th>Payout Ratio</th>
                    <th>% Insiders</th>
                    <th>% Institutions</th>
                    <th>Type</th>
                    <th>TtmDivs</th>
                </tr>
            </thead>
            <tbody>
                {tickers.map(ticker =>
                    <tr key={ticker.symbol}>
                        <td>{ticker.symbol}</td>
                        <td>{ticker.longName}</td>
                        <td>{ticker.sector}</td>
                        <td>{formatIndustryLabel(ticker.sector, ticker.industry)}</td>
                        <td>{ticker.snapshotDate}</td>
                        <td>{ticker.exDividendDate}</td>
                        <td>{ticker.lastDividendDate}</td>
                        <td>{formatEpochSeconds(ticker.regularMarketTime)}</td>
                        <td>{currencyFormatter.format(ticker.regularMarketPrice)}</td>
                        <td>{currencyFormatter.format(ticker.dividendRate)}</td>
                        <td>{ticker.dividendYield.toFixed(2)}%</td>
                        <td>{formatMarketCap(ticker.marketCap)}</td>
                        <td>{formatFractionAsPercent(ticker.payoutRatio)}</td>
                        <td>{formatFractionAsPercent(ticker.heldPercentInsiders)}</td>
                        <td>{formatFractionAsPercent(ticker.heldPercentInstitutions)}</td>
                        <td>{ticker.typeDisp}</td>
                        <td>{currencyFormatter.format(ticker.ttmDivs)}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <div>
            <h1 id="datastoreTableLabel">Datastore Overview</h1>
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

export default DatastoreView;
