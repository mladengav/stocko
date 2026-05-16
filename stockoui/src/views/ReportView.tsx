import { useEffect, useState } from 'react';
import { currencyFormatter } from '../lib/format';
import type { Position, PositionOverview } from './types';

const reportPositions: Position[] = [
    { symbol: 'BNS.TO', quantity: 100 },
    { symbol: 'TD.TO', quantity: 50 },
];

function ReportView() {
    const [positions, setPositions] = useState<PositionOverview[]>();

    useEffect(() => {
        if (positions === undefined) {
            populateReportData();
        }
    }, [positions]);

    const contents = positions === undefined
        ? <p><em>Loading...</em></p>
        : <table className="table table-striped" aria-labelledby="reportTableLabel">
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Quantity</th>
                    <th>TtmDivs</th>
                </tr>
            </thead>
            <tbody>
                {positions.map(row =>
                    <tr key={row.position.symbol}>
                        <td>{row.position.symbol}</td>
                        <td>{row.position.quantity}</td>
                        <td>{currencyFormatter.format(row.ttmDivs)}</td>
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

export default ReportView;
