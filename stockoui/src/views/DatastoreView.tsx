import { useEffect, useState } from 'react';
import { currencyFormatter } from '../lib/format';
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
                    <th>Price</th>
                    <th>Div Rate</th>
                    <th>Div Yield</th>
                    <th>Market Cap</th>
                    <th>Payout Ratio</th>
                    <th>TtmDivs</th>
                </tr>
            </thead>
            <tbody>
                {tickers.map(ticker =>
                    <tr key={ticker.symbol}>
                        <td>{ticker.symbol}</td>
                        <td>{ticker.longName}</td>
                        <td>{ticker.sectorKey}</td>
                        <td>{ticker.industryKey}</td>
                        <td>{ticker.snapshotDate}</td>
                        <td>{ticker.exDividendDateUtc}</td>
                        <td>{currencyFormatter.format(ticker.currentPrice)}</td>
                        <td>{currencyFormatter.format(ticker.dividendRate)}</td>
                        <td>{(ticker.dividendYield * 100).toFixed(2)}%</td>
                        <td>{currencyFormatter.format(ticker.marketCap)}</td>
                        <td>{(ticker.payoutRatio * 100).toFixed(2)}%</td>
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
