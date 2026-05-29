import { useEffect, useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
} from 'material-react-table';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
    currencyFormatter,
    formatEpochSeconds,
    formatFractionAsPercent,
    formatIndustryLabel,
    formatMarketCap,
} from '../lib/format';
import {
    calculatedKpisHeaderCellProps,
    calculatedKpisHeaderShade,
    getDefaultMrtTableOptions,
    leftAlignedCellProps,
    portfolioTotalsHeaderCellProps,
    portfolioTotalsHeaderShade,
    symbolBodyCellProps,
    TableColumnLegend,
    tickerDataHeaderCellProps,
    tickerDataHeaderShade,
} from '../lib/mrtTableStyle';
import PortfolioAllocations from './PortfolioAllocations';
import ReportInput from './ReportInput';
import type { Position, ReportRow, TickerOverview } from './types';

function ClientSideReportTable({ rows }: { rows: ReportRow[] }) {
    const columns = useMemo<MRT_ColumnDef<ReportRow>[]>(
        () => [
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.symbol,
                id: 'symbol',
                header: 'Symbol',
                ...symbolBodyCellProps<ReportRow>(),
                size: 100,
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                ...leftAlignedCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.longName,
                id: 'longName',
                header: 'Name',
                size: 250,
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.regularMarketPrice,
                id: 'regularMarketPrice',
                filterFn: 'between',
                header: 'Price',
                size: 100,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...portfolioTotalsHeaderCellProps<ReportRow>(),
                accessorKey: 'quantity',
                filterFn: 'between',
                header: 'Quantity',
                size: 100,
            },
            {
                ...portfolioTotalsHeaderCellProps<ReportRow>(),
                accessorKey: 'positionValue',
                filterFn: 'between',
                header: 'Position Value',
                size: 120,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.dividendRate,
                id: 'dividendRate',
                filterFn: 'between',
                header: 'Div Rate',
                size: 100,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...portfolioTotalsHeaderCellProps<ReportRow>(),
                accessorKey: 'positionFwdDividend',
                filterFn: 'between',
                header: 'Position FwdDividend',
                size: 150,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...calculatedKpisHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.ttmDivs,
                id: 'ttmDivs',
                filterFn: 'between',
                header: 'TtmDivs',
                size: 100,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...portfolioTotalsHeaderCellProps<ReportRow>(),
                accessorKey: 'positionTtmDividend',
                filterFn: 'between',
                header: 'Position TtmDividend',
                size: 150,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                ...leftAlignedCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.sector,
                filterVariant: 'autocomplete',
                id: 'sector',
                header: 'Sector',
                size: 150,
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                ...leftAlignedCellProps<ReportRow>(),
                accessorFn: (row) => formatIndustryLabel(row.ticker.sector, row.ticker.industry),
                filterVariant: 'autocomplete',
                id: 'industry',
                header: 'Industry',
                size: 200,
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.snapshotDate,
                id: 'snapshotDate',
                header: 'Snapshot',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.exDividendDate,
                id: 'exDividendDate',
                header: 'Ex-Div',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.lastDividendDate,
                id: 'lastDividendDate',
                header: 'Last Div',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.regularMarketTime,
                id: 'regularMarketTime',
                header: 'Market Time',
                size: 180,
                Cell: ({ row }) => formatEpochSeconds(row.original.ticker.regularMarketTime),
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.dividendYield,
                id: 'dividendYield',
                filterFn: 'between',
                header: 'Div Yield',
                size: 100,
                Cell: ({ cell }) => `${cell.getValue<number>().toFixed(2)}%`,
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.marketCap,
                id: 'marketCap',
                filterFn: 'between',
                header: 'Market Cap',
                size: 120,
                Cell: ({ cell }) => formatMarketCap(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.payoutRatio,
                id: 'payoutRatio',
                filterFn: 'between',
                header: 'Payout Ratio',
                size: 120,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.heldPercentInsiders,
                id: 'heldPercentInsiders',
                filterFn: 'between',
                header: '% Insiders',
                size: 120,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.heldPercentInstitutions,
                id: 'heldPercentInstitutions',
                filterFn: 'between',
                header: '% Institutions',
                size: 130,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.typeDisp,
                filterVariant: 'autocomplete',
                id: 'typeDisp',
                header: 'Type',
                size: 120,
            },
            {
                ...calculatedKpisHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.lastDividendDecrease,
                id: 'lastDividendDecrease',
                header: 'Last Div Decrease',
                size: 150,
            },
            {
                ...calculatedKpisHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.yearsSinceDividendDecrease,
                filterFn: 'between',
                id: 'yearsSinceDividendDecrease',
                header: 'Years Since Decrease',
                size: 170,
            },
            {
                ...calculatedKpisHeaderCellProps<ReportRow>(),
                accessorFn: (row) => row.ticker.yearsConsecutiveDividendIncrease,
                filterFn: 'between',
                id: 'yearsConsecutiveDividendIncrease',
                header: 'Years Consecutive Increase',
                size: 200,
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data: rows,
        getRowId: (row) => row.ticker.symbol,
        ...getDefaultMrtTableOptions<ReportRow>(),
    });

    return (
        <>
            <TableColumnLegend
                items={[
                    { shade: tickerDataHeaderShade, label: 'Direct Ticker Data' },
                    { shade: calculatedKpisHeaderShade, label: 'Calculated KPI Values' },
                    { shade: portfolioTotalsHeaderShade, label: 'Portfolio Totals' },
                ]}
            />
            <MaterialReactTable table={table} />
        </>
    );
}

function ClientSideReportView() {
    const [reportPositions, setReportPositions] = useState<Position[]>();
    const [tickers, setTickers] = useState<TickerOverview[]>();

    useEffect(() => {
        if (reportPositions !== undefined && tickers === undefined) {
            populateDatastoreData();  //TODO use TanStack Query to cache responses from back-end
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
            .filter((r): r is ReportRow => r !== undefined);
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ClientSideReportTable rows={rows} />
            </LocalizationProvider>
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
