import { useEffect, useState } from 'react';
import './App.css';

interface Forecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

interface TickerOverview {
    symbol: string;
    ttmDivs: number;
    lastDiv: number;
}

interface Position {
    symbol: string;
    quantity: number;
}

interface PositionOverview {
    position: Position;
    ttmDivs: number;
    lastDiv: number;
}

const reportPositions: Position[] = [
    { symbol: 'BNS.TO', quantity: 100 },
    { symbol: 'TD.TO', quantity: 50 },
];

type View = 'weather' | 'datastore' | 'report';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD',
});

function App() {
    const [view, setView] = useState<View>('weather');
    const [forecasts, setForecasts] = useState<Forecast[]>();
    const [tickers, setTickers] = useState<TickerOverview[]>();
    const [positions, setPositions] = useState<PositionOverview[]>();

    useEffect(() => {
        populateWeatherData();
    }, []);

    useEffect(() => {
        if (view === 'datastore' && tickers === undefined) {
            populateDatastoreData();
        }
    }, [view, tickers]);

    useEffect(() => {
        if (view === 'report' && positions === undefined) {
            populateReportData();
        }
    }, [view, positions]);

    return (
        <div className="app-shell">
            <nav className="app-nav">
                <button
                    className={view === 'weather' ? 'active' : ''}
                    onClick={() => setView('weather')}
                >
                    Weather
                </button>
                <button
                    className={view === 'datastore' ? 'active' : ''}
                    onClick={() => setView('datastore')}
                >
                    Datastore
                </button>
                <button
                    className={view === 'report' ? 'active' : ''}
                    onClick={() => setView('report')}
                >
                    Report
                </button>
            </nav>
            <main className="app-content">
                {view === 'weather' && renderWeather()}
                {view === 'datastore' && renderDatastore()}
                {view === 'report' && renderReport()}
            </main>
        </div>
    );

    function renderWeather() {
        const contents = forecasts === undefined
            ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
            : <table className="table table-striped" aria-labelledby="tableLabel">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Temp. (C)</th>
                        <th>Temp. (F)</th>
                        <th>Summary</th>
                    </tr>
                </thead>
                <tbody>
                    {forecasts.map(forecast =>
                        <tr key={forecast.date}>
                            <td>{forecast.date}</td>
                            <td>{forecast.temperatureC}</td>
                            <td>{forecast.temperatureF}</td>
                            <td>{forecast.summary}</td>
                        </tr>
                    )}
                </tbody>
            </table>;

        return (
            <div>
                <h1 id="tableLabel">Weather forecast</h1>
                <p>This component demonstrates fetching data from the server.</p>
                {contents}
            </div>
        );
    }

    function renderDatastore() {
        const contents = tickers === undefined
            ? <p><em>Loading...</em></p>
            : <table className="table table-striped" aria-labelledby="datastoreTableLabel">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>TtmDivs</th>
                        <th>LastDiv</th>
                    </tr>
                </thead>
                <tbody>
                    {tickers.map(ticker =>
                        <tr key={ticker.symbol}>
                            <td>{ticker.symbol}</td>
                            <td>{currencyFormatter.format(ticker.ttmDivs)}</td>
                            <td>{currencyFormatter.format(ticker.lastDiv)}</td>
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
    }

    function renderReport() {
        const contents = positions === undefined
            ? <p><em>Loading...</em></p>
            : <table className="table table-striped" aria-labelledby="reportTableLabel">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Quantity</th>
                        <th>TtmDivs</th>
                        <th>LastDiv</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map(row =>
                        <tr key={row.position.symbol}>
                            <td>{row.position.symbol}</td>
                            <td>{row.position.quantity}</td>
                            <td>{currencyFormatter.format(row.ttmDivs)}</td>
                            <td>{currencyFormatter.format(row.lastDiv)}</td>
                        </tr>
                    )}
                </tbody>
            </table>;

        return (
            <div>
                <h1 id="reportTableLabel">Position Report</h1>
                {contents}
            </div>
        );
    }

    async function populateWeatherData() {
        const response = await fetch('weatherforecast');
        if (response.ok) {
            const data = await response.json();
            setForecasts(data);
        }
    }

    async function populateDatastoreData() {
        const response = await fetch('datastore/overview');
        if (response.ok) {
            const data = await response.json();
            setTickers(data);
        }
    }

    async function populateReportData() {
        const response = await fetch('report/aggregate-positions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportPositions),
        });
        if (response.ok) {
            const data = await response.json();
            setPositions(data);
        }
    }
}

export default App;
