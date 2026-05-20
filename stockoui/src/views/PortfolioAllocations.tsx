import { useMemo, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { PieChart, pieClasses } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { currencyFormatter, formatIndustryLabel } from '../lib/format';

interface PortfolioAllocationsProps {
    rows: ReadonlyArray<{
        ticker: { sector: string; industry: string };
        positionValue: number;
        positionFwdDividend: number;
    }>;
    portfolioValue: number;
    portfolioFwdDividend: number;
}

interface SliceDatum {
    id: string;
    label: string | ((location: 'tooltip' | 'legend' | 'arc') => string);
    value: number;
    color: string;
}

interface SectorAggregate {
    key: string;
    value: number;
    industries: { key: string; value: number }[];
}

function aggregateRows(rows: PortfolioAllocationsProps['rows'], metric: keyof Pick<PortfolioAllocationsProps['rows'][number], 'positionValue' | 'positionFwdDividend'>): SectorAggregate[] {
    const bySector = new Map<string, { value: number; industries: Map<string, number> }>();
    for (const row of rows) {
        const sector = row.ticker.sector;
        const industry = row.ticker.industry;
        const weight = row[metric];
        let sectorAggregate = bySector.get(sector);
        if (sectorAggregate === undefined) {
            sectorAggregate = { value: 0, industries: new Map() };
            bySector.set(sector, sectorAggregate);
        }
        sectorAggregate.value += weight;
        sectorAggregate.industries.set(
            industry,
            (sectorAggregate.industries.get(industry) ?? 0) + weight,
        );
    }
    return Array.from(bySector, ([sector, sectorAggregate]) => ({
        key: sector,
        value: sectorAggregate.value,
        industries: Array.from(sectorAggregate.industries, ([industry, value]) => ({
            key: industry,
            value,
        })),
    }));
}

const sectorPalette = [
    '#1976d2',
    '#388e3c',
    '#d32f2f',
    '#f57c00',
    '#7b1fa2',
    '#0097a7',
    '#fbc02d',
    '#5d4037',
    '#455a64',
    '#c2185b',
];

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getSectorColor(sectorIndex: number): string {
    return sectorPalette[sectorIndex % sectorPalette.length];
}

function getIndustryColor(
    sectorIndex: number,
    industryIndex: number,
    industryCount: number,
): string {
    const alpha = industryCount === 1 ? 0.85 : 0.55 + (0.45 * industryIndex) / (industryCount - 1);
    return hexToRgba(getSectorColor(sectorIndex), alpha);
}

const StyledCenterText = styled('text')(({ theme }: { theme: Theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: 20,
}));

interface ColorSwatchLabelProps {
    color: string;
    children: ReactNode;
    /** Sector rowspan cells vertically center swatch + text in the merged row */
    swatchMiddle?: boolean;
}

function ColorSwatchLabel({ color, children, swatchMiddle }: ColorSwatchLabelProps) {
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: swatchMiddle ? 'center' : 'flex-start',
                gap: 0.875,
                lineHeight: 1.35,
                verticalAlign: 'middle',
            }}
        >
            <Box
                component="span"
                aria-hidden
                sx={(theme) => ({
                    mt: swatchMiddle ? 0 : '0.2em',
                    width: 11,
                    height: 11,
                    flexShrink: 0,
                    borderRadius: '2px',
                    bgcolor: color,
                    boxSizing: 'border-box',
                    border: `1px solid ${
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'
                    }`,
                })}
            />
            <Box component="span">{children}</Box>
        </Box>
    );
}

function PieCenterLabel({ children }: { children: ReactNode }) {
    const { width, height, left, top } = useDrawingArea();
    return (
        <StyledCenterText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledCenterText>
    );
}

function buildSectorSlices(allocations: SectorAggregate[]): SliceDatum[] {
    return allocations.map((sector, idx) => ({
        id: sector.key,
        label: sector.key,
        value: sector.value,
        color: getSectorColor(idx),
    }));
}

function buildIndustrySlices(allocations: SectorAggregate[]): SliceDatum[] {
    return allocations.flatMap((sector, sectorIdx) => {
        const count = sector.industries.length;
        return sector.industries.map((industry, industryIdx) => {
            const industryLabel = formatIndustryLabel(sector.key, industry.key);
            return {
                id: `${sector.key}|${industry.key}`,
                label: (location: 'tooltip' | 'legend' | 'arc') =>
                    location === 'arc'
                        ? industryLabel
                        : `${sector.key} - ${industryLabel}`,
                value: industry.value,
                color: getIndustryColor(sectorIdx, industryIdx, count),
            };
        });
    });
}

type ViewType = 'allocation' | 'income';

function PortfolioAllocations({ rows, portfolioValue, portfolioFwdDividend }: PortfolioAllocationsProps) {
    const [view, setView] = useState<ViewType>('allocation');

    const handleViewChange = (
        _event: MouseEvent<HTMLElement>,
        newView: ViewType | null,
    ) => {
        if (newView !== null) {
            setView(newView);
        }
    };

    const allocationsByValue = useMemo(
        () => (portfolioValue === 0 ? [] : aggregateRows(rows, 'positionValue')),
        [rows, portfolioValue],
    );

    const allocationsByFwd = useMemo(
        () => (portfolioFwdDividend === 0 ? [] : aggregateRows(rows, 'positionFwdDividend')),
        [rows, portfolioFwdDividend],
    );

    const sectorSlicesValue = useMemo(() => buildSectorSlices(allocationsByValue), [allocationsByValue]);
    const industrySlicesValue = useMemo(() => buildIndustrySlices(allocationsByValue), [allocationsByValue]);

    const sectorSlicesFwd = useMemo(() => buildSectorSlices(allocationsByFwd), [allocationsByFwd]);
    const industrySlicesFwd = useMemo(() => buildIndustrySlices(allocationsByFwd), [allocationsByFwd]);

    const innerRadius = 60;
    const middleRadius = 130;
    const outerRadius = middleRadius + 25;

    const valueFormatter = ({ value }: { value: number }) => currencyFormatter.format(value);

    const makeArcLabel = (denominator: number) =>
        (item: { label?: string; value: number }) => {
            if (denominator === 0) return '';
            const pct = ((item.value / denominator) * 100).toFixed(0);
            return `${item.label ?? ''} (${pct}%)`;
        };

    const allocationArcLabel = useMemo(() => makeArcLabel(portfolioValue), [portfolioValue]);
    const incomeArcLabel = useMemo(() => makeArcLabel(portfolioFwdDividend), [portfolioFwdDividend]);

    const totalIndustryRowsValue = allocationsByValue.reduce((sum, s) => sum + s.industries.length, 0);
    const totalIndustryRowsFwd = allocationsByFwd.reduce((sum, s) => sum + s.industries.length, 0);

    const aggregationTable = ({
        aggregates,
        denominator,
        totalIndustryRows,
        ariaLabel,
    }: {
        aggregates: SectorAggregate[];
        denominator: number;
        totalIndustryRows: number;
        ariaLabel: string;
    }) =>
        totalIndustryRows === 0 || denominator === 0 ? null : (
            <Box
                sx={{
                    mt: 3,
                    width: '100%',
                    overflowX: 'auto',
                    textAlign: 'left',
                    '& table': {
                        width: '100%',
                        maxWidth: 720,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        borderCollapse: 'collapse',
                        fontSize: '0.95rem',
                    },
                    '& thead th': {
                        fontWeight: 600,
                        color: 'text.primary',
                        pb: 1,
                        pt: 0,
                    },
                    '& tbody td': {
                        py: 0.75,
                        verticalAlign: 'top',
                        color: 'text.secondary',
                    },
                }}
            >
                <table aria-label={ariaLabel}>
                    <thead>
                        <tr>
                            <th scope="col">Sector</th>
                            <th scope="col">Allocation</th>
                            <th scope="col">Industry</th>
                            <th scope="col">Allocation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregates.flatMap((sector, sectorIdx) =>
                            sector.industries.map((industry, industryIdx) => {
                                const sectorColor = getSectorColor(sectorIdx);
                                const industryColor = getIndustryColor(
                                    sectorIdx,
                                    industryIdx,
                                    sector.industries.length,
                                );
                                return (
                                    <tr key={`${sector.key}|${industry.key}`}>
                                        {industryIdx === 0 ? (
                                            <>
                                                <td
                                                    rowSpan={sector.industries.length}
                                                    style={{ verticalAlign: 'middle' }}
                                                >
                                                    <ColorSwatchLabel color={sectorColor} swatchMiddle>
                                                        {sector.key}
                                                    </ColorSwatchLabel>
                                                </td>
                                                <td
                                                    rowSpan={sector.industries.length}
                                                    style={{ verticalAlign: 'middle' }}
                                                >
                                                    <ColorSwatchLabel color={sectorColor} swatchMiddle>
                                                        {(sector.value / denominator * 100).toFixed(2)}%
                                                    </ColorSwatchLabel>
                                                </td>
                                            </>
                                        ) : null}
                                        <td>
                                            <ColorSwatchLabel color={industryColor}>
                                                {formatIndustryLabel(sector.key, industry.key)}
                                            </ColorSwatchLabel>
                                        </td>
                                        <td>
                                            <ColorSwatchLabel color={industryColor}>
                                                {(industry.value / denominator * 100).toFixed(2)}%
                                            </ColorSwatchLabel>
                                        </td>
                                    </tr>
                                );
                            }),
                        )}
                    </tbody>
                </table>
            </Box>
        );

    const pieChartSx = {
        [`& .${pieClasses.arcLabel}`]: {
            fontSize: '12px',
        },
    } as const;

    const allocationPie = portfolioValue !== 0 && (
        <PieChart
            series={[
                {
                    innerRadius,
                    outerRadius: middleRadius,
                    data: sectorSlicesValue,
                    valueFormatter,
                    arcLabel: allocationArcLabel,
                    arcLabelMinAngle: 15,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    highlighted: { additionalRadius: 2 },
                    cornerRadius: 3,
                },
                {
                    innerRadius: middleRadius,
                    outerRadius,
                    data: industrySlicesValue,
                    valueFormatter,
                    arcLabel: allocationArcLabel,
                    arcLabelMinAngle: 15,
                    arcLabelRadius: outerRadius + 15,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    highlighted: { additionalRadius: 2 },
                    cornerRadius: 3,
                },
            ]}
            sx={pieChartSx}
            hideLegend
        >
            <PieCenterLabel>Allocation</PieCenterLabel>
        </PieChart>
    );

    const incomePie = portfolioFwdDividend !== 0 && allocationsByFwd.length > 0 ? (
        <PieChart
            series={[
                {
                    innerRadius,
                    outerRadius: middleRadius,
                    data: sectorSlicesFwd,
                    valueFormatter,
                    arcLabel: incomeArcLabel,
                    arcLabelMinAngle: 15,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    highlighted: { additionalRadius: 2 },
                    cornerRadius: 3,
                },
                {
                    innerRadius: middleRadius,
                    outerRadius,
                    data: industrySlicesFwd,
                    valueFormatter,
                    arcLabel: incomeArcLabel,
                    arcLabelMinAngle: 15,
                    arcLabelRadius: outerRadius + 15,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    highlighted: { additionalRadius: 2 },
                    cornerRadius: 3,
                },
            ]}
            sx={pieChartSx}
            hideLegend
        >
            <PieCenterLabel>Income</PieCenterLabel>
        </PieChart>
    ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', px: 2 }}>
                No portfolio forward dividend to chart.
        </Box>
    );

    return (
        <Box sx={{ width: '100%', textAlign: 'center', my: 3 }}>
            <ToggleButtonGroup
                color="primary"
                size="small"
                value={view}
                exclusive
                onChange={handleViewChange}
                aria-label="Portfolio Allocations view"
                sx={{ mb: 2 }}
            >
                <ToggleButton value="allocation">Allocation</ToggleButton>
                <ToggleButton value="income">Income</ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ display: 'flex', justifyContent: 'center', height: 400 }}>
                {view === 'allocation' ? allocationPie : incomePie}
            </Box>

            {view === 'allocation'
                ? aggregationTable({
                    aggregates: allocationsByValue,
                    denominator: portfolioValue,
                    totalIndustryRows: totalIndustryRowsValue,
                    ariaLabel: 'Portfolio allocation by market value',
                })
                : aggregationTable({
                    aggregates: allocationsByFwd,
                    denominator: portfolioFwdDividend,
                    totalIndustryRows: totalIndustryRowsFwd,
                    ariaLabel: 'Portfolio allocation by forward dividend',
                })}
        </Box>
    );
}

export default PortfolioAllocations;
