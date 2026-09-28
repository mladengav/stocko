import { Box, type Theme } from '@mui/material';

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
