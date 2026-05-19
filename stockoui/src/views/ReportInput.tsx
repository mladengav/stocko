import { useState, type CSSProperties, type ComponentType, type DragEvent, type MouseEvent } from 'react';
import {
    useCSVReader,
    lightenDarkenColor,
    formatFileSize,
} from 'react-papaparse';
import type { ParseError, ParseResult } from 'papaparse';
import type { Position } from './types';

const GREY = '#CCC';
const GREY_LIGHT = 'rgba(255, 255, 255, 0.4)';
const DEFAULT_REMOVE_HOVER_COLOR = '#A01919';
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
    DEFAULT_REMOVE_HOVER_COLOR,
    40,
);
const GREY_DIM = '#686868';

const styles = {
    zone: {
        alignItems: 'center',
        border: `2px dashed ${GREY}`,
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        padding: 20,
    } as CSSProperties,
    file: {
        background: 'linear-gradient(to bottom, #EEE, #DDD)',
        borderRadius: 20,
        display: 'flex',
        height: 120,
        width: 120,
        position: 'relative',
        zIndex: 10,
        flexDirection: 'column',
        justifyContent: 'center',
    } as CSSProperties,
    info: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: 10,
        paddingRight: 10,
    } as CSSProperties,
    size: {
        backgroundColor: GREY_LIGHT,
        borderRadius: 3,
        marginBottom: '0.5em',
        justifyContent: 'center',
        display: 'flex',
    } as CSSProperties,
    name: {
        backgroundColor: GREY_LIGHT,
        borderRadius: 3,
        fontSize: 12,
        marginBottom: '0.5em',
    } as CSSProperties,
    progressBar: {
        bottom: 14,
        position: 'absolute',
        width: '100%',
        paddingLeft: 10,
        paddingRight: 10,
    } as CSSProperties,
    zoneHover: {
        borderColor: GREY_DIM,
    } as CSSProperties,
    remove: {
        height: 23,
        position: 'absolute',
        right: 6,
        top: 6,
        width: 23,
    } as CSSProperties,
};

type CsvRow = Record<string, string> | string[];

export type ParsePositionsResult =
    | { ok: true; positions: Position[] }
    | { ok: false; error: string };

function formatParseError(error: ParseError): string {
    const row = error.row !== undefined ? ` (row ${error.row + 1})` : '';
    return `${error.message}${row}`;
}

function formatParseErrors(errors: ParseError[]): string {
    return errors.map(formatParseError).join('; ');
}

function collectParseErrors(errors: ParseResult<CsvRow>['errors']): ParseError[] {
    if (errors === undefined || errors.length === 0) return [];
    return errors.flatMap(entry => (Array.isArray(entry) ? entry : [entry]));
}

function parsePositionsFromCsv(results: ParseResult<CsvRow>): ParsePositionsResult {
    const parseErrors = collectParseErrors(results.errors);
    if (parseErrors.length > 0) {
        return {
            ok: false,
            error: `CSV parse error: ${formatParseErrors(parseErrors)}`,
        };
    }

    const positions = results.data
        .map(row => {
            if (Array.isArray(row)) {
                const symbol = row[0]?.trim();
                const quantity = Number(row[1]);
                if (!symbol || Number.isNaN(quantity)) return undefined;
                return { symbol, quantity };
            }
            const keys = Object.keys(row);
            const symbolKey = keys.find(k => k.toLowerCase() === 'symbol');
            const quantityKey = keys.find(k => k.toLowerCase() === 'quantity');
            if (symbolKey === undefined || quantityKey === undefined) return undefined;
            const symbol = row[symbolKey]?.trim();
            const quantity = Number(row[quantityKey]);
            if (!symbol || Number.isNaN(quantity)) return undefined;
            return { symbol, quantity };
        })
        .filter((p): p is Position => p !== undefined);

    if (positions.length === 0) {
        return {
            ok: false,
            error: 'No valid rows found. CSV needs header columns symbol and quantity.',
        };
    }

    return { ok: true, positions };
}

export interface ReportInputProps {
    onPositionsLoaded: (positions: Position[]) => void;
}

function ReportInput({ onPositionsLoaded }: ReportInputProps) {
    const { CSVReader } = useCSVReader();
    const [zoneHover, setZoneHover] = useState(false);
    const [parseError, setParseError] = useState<string>();
    const [removeHoverColor, setRemoveHoverColor] = useState(
        DEFAULT_REMOVE_HOVER_COLOR,
    );

    return (
        <>
        {parseError !== undefined && (
            <p className="text-danger" role="alert">{parseError}</p>
        )}
        <CSVReader
            config={{
                header: true,
                skipEmptyLines: true,
                transform: (value: string) => (typeof value === 'string' ? value.trim() : value),
                transformHeader: (header: string) => header.trim().replace(/^\ufeff/, '').toLowerCase(),
                beforeFirstChunk: (chunk: string) => {
                    const lines = chunk.split(/\r\n|\r|\n/);

                    //trim malformed csv lines
                    lines.forEach((val, index, array) => {
                        array[index] = val.trim();
                    });

                    // Return the sanitized CSV string
                    return lines.join('\n');
                }
            }}
            onUploadAccepted={(results: ParseResult<CsvRow>) => {
                const parsed = parsePositionsFromCsv(results);
                if (parsed.ok) {
                    setParseError(undefined);
                    onPositionsLoaded(parsed.positions);
                } else {
                    setParseError(parsed.error);
                }
                setZoneHover(false);
            }}
            onDragOver={(event: DragEvent) => {
                event.preventDefault();
                setZoneHover(true);
            }}
            onDragLeave={(event: DragEvent) => {
                event.preventDefault();
                setZoneHover(false);
            }}
        >
            {({
                getRootProps,
                acceptedFile,
                ProgressBar,
                getRemoveFileProps,
                Remove,
            }: {
                getRootProps: () => object;
                acceptedFile?: File;
                ProgressBar: ComponentType;
                getRemoveFileProps: () => object;
                Remove: ComponentType<{ color: string }>;
            }) => (
                <div
                    {...getRootProps()}
                    style={Object.assign(
                        {},
                        styles.zone,
                        zoneHover && styles.zoneHover,
                    )}
                >
                    {acceptedFile ? (
                        <div style={styles.file}>
                            <div style={styles.info}>
                                <span style={styles.size}>
                                    {formatFileSize(acceptedFile.size)}
                                </span>
                                <span style={styles.name}>{acceptedFile.name}</span>
                            </div>
                            <div style={styles.progressBar}>
                                <ProgressBar />
                            </div>
                            <div
                                {...getRemoveFileProps()}
                                style={styles.remove}
                                onMouseOver={(event: MouseEvent) => {
                                    event.preventDefault();
                                    setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                                }}
                                onMouseOut={(event: MouseEvent) => {
                                    event.preventDefault();
                                    setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                                }}
                            >
                                <Remove color={removeHoverColor} />
                            </div>
                        </div>
                    ) : (
                        'Drop CSV file here or click to upload (columns: symbol, quantity)'
                    )}
                </div>
            )}
        </CSVReader>
        </>
    );
}

export default ReportInput;
