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
    symbolBodyCellProps,
    TableColumnLegend,
    tickerDataHeaderCellProps,
    tickerDataHeaderShade,
} from '../lib/mrtTableStyle';
import type { TickerOverview } from './types';

function DatastoreTable({ tickers }: { tickers: TickerOverview[] }) {
    const columns = useMemo<MRT_ColumnDef<TickerOverview>[]>(
        () => [
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'symbol',
                header: 'Symbol',
                ...symbolBodyCellProps<TickerOverview>(),
                size: 100,
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                ...leftAlignedCellProps<TickerOverview>(),
                accessorKey: 'longName',
                header: 'Name',
                size: 250,
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                ...leftAlignedCellProps<TickerOverview>(),
                accessorKey: 'sector',
                filterVariant: 'autocomplete',
                header: 'Sector',
                size: 150,
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                ...leftAlignedCellProps<TickerOverview>(),
                accessorFn: (row) => formatIndustryLabel(row.sector, row.industry),
                id: 'industry',
                filterVariant: 'autocomplete',
                header: 'Industry',
                size: 200,
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'snapshotDate',
                header: 'Snapshot',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'exDividendDate',
                header: 'Ex-Div',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'lastDividendDate',
                header: 'Last Div',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorFn: (row) => row.regularMarketTime,
                id: 'regularMarketTime',
                header: 'Market Time',
                size: 180,
                Cell: ({ row }) => formatEpochSeconds(row.original.regularMarketTime),
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'regularMarketPrice',
                filterFn: 'between',
                header: 'Price',
                size: 100,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'dividendRate',
                filterFn: 'between',
                header: 'Div Rate',
                size: 100,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'dividendYield',
                filterFn: 'between',
                header: 'Div Yield',
                size: 100,
                Cell: ({ cell }) => `${cell.getValue<number>().toFixed(2)}%`,
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'marketCap',
                filterFn: 'between',
                header: 'Market Cap',
                size: 120,
                Cell: ({ cell }) => formatMarketCap(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'payoutRatio',
                filterFn: 'between',
                header: 'Payout Ratio',
                size: 120,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'heldPercentInsiders',
                filterFn: 'between',
                header: '% Insiders',
                size: 120,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'heldPercentInstitutions',
                filterFn: 'between',
                header: '% Institutions',
                size: 130,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps<TickerOverview>(),
                accessorKey: 'typeDisp',
                filterVariant: 'autocomplete',
                header: 'Type',
                size: 120,
            },
            {
                ...calculatedKpisHeaderCellProps<TickerOverview>(),
                accessorKey: 'lastDividendDecrease',
                header: 'Last Div Decrease',
                size: 150,
            },
            {
                ...calculatedKpisHeaderCellProps<TickerOverview>(),
                accessorKey: 'yearsSinceDividendDecrease',
                filterFn: 'between',
                header: 'Years Since Div. Decr.',
                size: 170,
            },
            {
                ...calculatedKpisHeaderCellProps<TickerOverview>(),
                accessorKey: 'yearsConsecutiveDividendIncrease',
                filterFn: 'between',
                header: 'Years Cons. Div. Increase',
                size: 200,
            },
            {
                ...calculatedKpisHeaderCellProps<TickerOverview>(),
                accessorKey: 'ttmDivs',
                filterFn: 'between',
                header: 'TTM Dividends',
                size: 100,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data: tickers,
        ...getDefaultMrtTableOptions<TickerOverview>(),
    });

    return (
        <>
            <TableColumnLegend
                items={[
                    { shade: tickerDataHeaderShade, label: 'Direct Ticker Data' },
                    { shade: calculatedKpisHeaderShade, label: 'Calculated KPI Values' },
                ]}
            />
            <MaterialReactTable table={table} />
        </>
    );
}

function DatastoreView() {
    const [tickers, setTickers] = useState<TickerOverview[]>();

    useEffect(() => {
        if (tickers === undefined) {
            populateDatastoreData();  //TODO use TanStack Query to cache tickers and reduce calls to back end
        }
    }, [tickers]);

    const contents = tickers === undefined
        ? <p><em>Loading...</em></p>
        : (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatastoreTable tickers={tickers} />
            </LocalizationProvider>
        );

    return (
        <div className="datastore-view">
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
