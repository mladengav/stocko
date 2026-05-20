import {
    MRT_GlobalFilterTextField,
    MRT_ToggleFiltersButton,
    type MRT_ColumnDef,
    type MRT_RowData,
    type MRT_TableOptions,
} from 'material-react-table';
import { Box, alpha, lighten, type Theme } from '@mui/material';

export const tickerDataHeaderShade = (theme: Theme) =>
    theme.palette.mode === 'dark'
        ? alpha(theme.palette.info.light, 0.14)
        : alpha(theme.palette.info.main, 0.1);

export const calculatedKpisHeaderShade = (theme: Theme) =>
    theme.palette.mode === 'dark'
        ? alpha(theme.palette.success.light, 0.18)
        : alpha(theme.palette.success.main, 0.12);

export const portfolioTotalsHeaderShade = (theme: Theme) =>
    theme.palette.mode === 'dark'
        ? alpha(theme.palette.warning.light, 0.18)
        : alpha(theme.palette.warning.main, 0.12);

export function shadedHeaderCellProps<T extends MRT_RowData>(
    backgroundColor: (theme: Theme) => string,
): Pick<MRT_ColumnDef<T>, 'muiTableHeadCellProps'> {
    return {
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
    };
}

export function leftAlignedCellProps<T extends MRT_RowData>(): Pick<
    MRT_ColumnDef<T>,
    'muiTableBodyCellProps'
> {
    return {
        muiTableBodyCellProps: { align: 'left' },
    };
}

export function symbolBodyCellProps<T extends MRT_RowData>(): Pick<
    MRT_ColumnDef<T>,
    'muiTableBodyCellProps'
> {
    return {
        muiTableBodyCellProps: {
            align: 'left',
            sx: { pl: 6 },
        },
    };
}

export function tickerDataHeaderCellProps<T extends MRT_RowData>() {
    return shadedHeaderCellProps<T>(tickerDataHeaderShade);
}

export function calculatedKpisHeaderCellProps<T extends MRT_RowData>() {
    return shadedHeaderCellProps<T>(calculatedKpisHeaderShade);
}

export function portfolioTotalsHeaderCellProps<T extends MRT_RowData>() {
    return shadedHeaderCellProps<T>(portfolioTotalsHeaderShade);
}

export interface LegendItem {
    label: string;
    shade: (theme: Theme) => string;
}

export function TableColumnLegend({ items }: { items: LegendItem[] }) {
    return (
        <Box
            component="table"
            sx={{ borderCollapse: 'collapse', mb: 0, width: 'auto' }}
        >
            <Box component="tbody">
                <Box component="tr">
                    <Box component="td" sx={{ border: 'none', fontWeight: 'bold', pr: 2.5, whiteSpace: 'nowrap' }}>
                        Legend:
                    </Box>
                    {items.map((item, index) => (
                        <Box component="td" key={item.label} sx={{ border: 'none', p: 0 }}>
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                {index > 0 && (
                                    <Box component="span" aria-hidden sx={{ display: 'inline-block', width: 8 }} />
                                )}
                                <Box
                                    aria-hidden
                                    component="span"
                                    sx={(theme) => ({
                                        backgroundColor: item.shade(theme),
                                        border: `1px solid ${theme.palette.divider}`,
                                        display: 'inline-block',
                                        height: 16,
                                        width: 16,
                                    })}
                                />
                                <Box component="span" sx={{ pl: 1, pr: index < items.length - 1 ? 1 : 0, whiteSpace: 'nowrap' }}>
                                    {item.label}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

export function getDefaultMrtTableOptions<T extends MRT_RowData>(): Pick<
    MRT_TableOptions<T>,
    | 'enableColumnFilterModes'
    | 'enableFacetedValues'
    | 'initialState'
    | 'muiSearchTextFieldProps'
    | 'muiPaginationProps'
    | 'paginationDisplayMode'
    | 'muiTableProps'
    | 'muiTableHeadCellProps'
    | 'muiTableBodyCellProps'
    | 'renderTopToolbar'
> {
    return {
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
    };
}
