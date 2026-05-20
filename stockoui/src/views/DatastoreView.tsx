import { useEffect, useMemo, useState } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
    MRT_GlobalFilterTextField,
    MRT_ToggleFiltersButton,
} from 'material-react-table';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Box, alpha, lighten, type Theme } from '@mui/material';
import {
    currencyFormatter,
    formatEpochSeconds,
    formatFractionAsPercent,
    formatIndustryLabel,
    formatMarketCap,
} from '../lib/format';
import type { TickerOverview } from './types';

const leftAlignedCellProps: Pick<MRT_ColumnDef<TickerOverview>, 'muiTableBodyCellProps'> = {
    muiTableBodyCellProps: { align: 'left' },
};

const tickerDataHeaderShade = (theme: Theme) =>
    theme.palette.mode === 'dark'
        ? alpha(theme.palette.info.light, 0.14)
        : alpha(theme.palette.info.main, 0.1);

const calculatedKpisHeaderShade = (theme: Theme) =>
    theme.palette.mode === 'dark'
        ? alpha(theme.palette.success.light, 0.18)
        : alpha(theme.palette.success.main, 0.12);

const shadedHeaderCellProps = (
    backgroundColor: (theme: Theme) => string,
): Pick<MRT_ColumnDef<TickerOverview>, 'muiTableHeadCellProps'> => ({
    muiTableHeadCellProps: {
        align: 'center',
        sx: (theme) => ({
            verticalAlign: 'middle',
            backgroundColor: backgroundColor(theme),
            '& .Mui-TableHeadCell-Content': {
                alignItems: 'center',
                justifyContent: 'center',
            },
        }),
    },
});

const tickerDataHeaderCellProps = shadedHeaderCellProps(tickerDataHeaderShade);
const calculatedKpisHeaderCellProps = shadedHeaderCellProps(calculatedKpisHeaderShade);

function DatastoreLegend() {
    return (
        <Box
            component="table"
            sx={{ borderCollapse: 'collapse', mb: 1, width: 'auto' }}
        >
            <Box component="tbody">
                <Box component="tr">
                    <Box component="td" sx={{ border: 'none', fontWeight: 'bold', pr: 2.5, whiteSpace: 'nowrap' }}>
                        Legend:
                    </Box>
                    <Box
                        aria-hidden
                        component="td"
                        sx={(theme) => ({
                            backgroundColor: tickerDataHeaderShade(theme),
                            border: `1px solid ${theme.palette.divider}`,
                            height: 16,
                            p: 0,
                            width: 16,
                        })}
                    />
                    <Box component="td" sx={{ border: 'none', pl: 1, pr: 1, whiteSpace: 'nowrap' }}>
                        Direct Ticker Data
                    </Box>
                    <Box component="td" sx={{ border: 'none', width: 8 }} aria-hidden />
                    <Box
                        aria-hidden
                        component="td"
                        sx={(theme) => ({
                            backgroundColor: calculatedKpisHeaderShade(theme),
                            border: `1px solid ${theme.palette.divider}`,
                            height: 16,
                            p: 0,
                            width: 16,
                        })}
                    />
                    <Box component="td" sx={{ border: 'none', pl: 1, whiteSpace: 'nowrap' }}>
                        Calculated KPI Values
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

function DatastoreTable({ tickers }: { tickers: TickerOverview[] }) {
    const columns = useMemo<MRT_ColumnDef<TickerOverview>[]>(
        () => [
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'symbol',
                header: 'Symbol',
                muiTableBodyCellProps: {
                    align: 'left',
                    sx: { pl: 6 },
                },
                size: 100,
            },
            {
                ...tickerDataHeaderCellProps,
                ...leftAlignedCellProps,
                accessorKey: 'longName',
                header: 'Name',
                size: 250,
            },
            {
                ...tickerDataHeaderCellProps,
                ...leftAlignedCellProps,
                accessorKey: 'sector',
                filterVariant: 'autocomplete',
                header: 'Sector',
                size: 150,
            },
            {
                ...tickerDataHeaderCellProps,
                ...leftAlignedCellProps,
                accessorFn: (row) => formatIndustryLabel(row.sector, row.industry),
                id: 'industry',
                filterVariant: 'autocomplete',
                header: 'Industry',
                size: 200,
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'snapshotDate',
                header: 'Snapshot',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'exDividendDate',
                header: 'Ex-Div',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'lastDividendDate',
                header: 'Last Div',
                size: 120,
            },
            {
                ...tickerDataHeaderCellProps,
                accessorFn: (row) => row.regularMarketTime,
                id: 'regularMarketTime',
                header: 'Market Time',
                size: 180,
                Cell: ({ row }) => formatEpochSeconds(row.original.regularMarketTime),
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'regularMarketPrice',
                filterFn: 'between',
                header: 'Price',
                size: 100,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'dividendRate',
                filterFn: 'between',
                header: 'Div Rate',
                size: 100,
                Cell: ({ cell }) => currencyFormatter.format(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'dividendYield',
                filterFn: 'between',
                header: 'Div Yield',
                size: 100,
                Cell: ({ cell }) => `${cell.getValue<number>().toFixed(2)}%`,
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'marketCap',
                filterFn: 'between',
                header: 'Market Cap',
                size: 120,
                Cell: ({ cell }) => formatMarketCap(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'payoutRatio',
                filterFn: 'between',
                header: 'Payout Ratio',
                size: 120,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'heldPercentInsiders',
                filterFn: 'between',
                header: '% Insiders',
                size: 120,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'heldPercentInstitutions',
                filterFn: 'between',
                header: '% Institutions',
                size: 130,
                Cell: ({ cell }) => formatFractionAsPercent(cell.getValue<number>()),
            },
            {
                ...tickerDataHeaderCellProps,
                accessorKey: 'typeDisp',
                filterVariant: 'autocomplete',
                header: 'Type',
                size: 120,
            },
            {
                ...calculatedKpisHeaderCellProps,
                accessorKey: 'lastDividendDecrease',
                header: 'Last Div Decrease',
                size: 150,
            },
            {
                ...calculatedKpisHeaderCellProps,
                accessorKey: 'yearsSinceDividendDecrease',
                filterFn: 'between',
                header: 'Years Since Div. Decr.',
                size: 170,
            },
            {
                ...calculatedKpisHeaderCellProps,
                accessorKey: 'yearsConsecutiveDividendIncrease',
                filterFn: 'between',
                header: 'Years Cons. Div. Increase',
                size: 200,
            },
            {
                ...calculatedKpisHeaderCellProps,
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
        enableColumnFilterModes: true,
        enableFacetedValues: true,
        initialState: {
            showColumnFilters: false,
            showGlobalFilter: true,
        },
        muiSearchTextFieldProps: {
            size: 'small',
            variant: 'outlined',
        },
        muiPaginationProps: {
            color: 'secondary',
            rowsPerPageOptions: [10, 20, 30, 50],
            shape: 'rounded',
            variant: 'outlined',
        },
        paginationDisplayMode: 'pages',
        muiTableProps: {
            sx: (theme) => ({
                '& .MuiTableCell-root': {
                    borderRight: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiTableCell-root:first-of-type': {
                    borderLeft: `1px solid ${theme.palette.divider}`,
                },
            }),
        },
        muiTableHeadCellProps: {
            align: 'center',
            sx: {
                verticalAlign: 'middle',
                '& .Mui-TableHeadCell-Content': {
                    alignItems: 'center',
                    justifyContent: 'center',
                },
            },
        },
        muiTableBodyCellProps: {
            align: 'center',
        },
        renderTopToolbar: ({ table }) => (
            <Box
                sx={(theme) => ({
                    backgroundColor: lighten(theme.palette.background.default, 0.05),
                    display: 'flex',
                    gap: '0.5rem',
                    p: '8px',
                })}
            >
                <MRT_GlobalFilterTextField table={table} />
                <MRT_ToggleFiltersButton table={table} />
            </Box>
        ),
    });

    return (
        <>
            <DatastoreLegend />
            <MaterialReactTable table={table} />
        </>
    );
}

function DatastoreView() {
    const [tickers, setTickers] = useState<TickerOverview[]>();

    useEffect(() => {
        if (tickers === undefined) {
            populateDatastoreData();
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
