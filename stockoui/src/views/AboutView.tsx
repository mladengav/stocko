import { Alert, AlertTitle, Box, Link, Typography } from '@mui/material';
import type { View } from '../App';

const ELIGIBLE_DIVIDENDS_URL =
    'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/eligible-dividends.html';
const FINCOL_URL = 'https://github.com/mladengav/fincol';
const STOCKO_URL = 'https://github.com/mladengav/stocko';

interface AboutViewProps {
    onNavigate: (view: View) => void;
}

function AboutView({ onNavigate }: AboutViewProps) {
    return (
        <Box sx={{ width: 'min(720px, 92vw)', mx: 'auto' }}>
            <h1>About DividendMaple</h1>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 8 }}>
                What is DividendMaple?
            </Typography>
            <Typography component="p" sx={{ mb: 2 }}>
                DividendMaple is a financial analysis app that focuses on Canadian
                dividend-paying stocks. Specifically, stocks paying{' '}
                <Link href={ELIGIBLE_DIVIDENDS_URL} target="_blank" rel="noopener noreferrer">
                    eligible dividends
                </Link>{' '}
                are the main focus, but support for all Canadian dividend stocks and
                ETFs is planned for the future.
            </Typography>
            <Typography component="p" sx={{ mb: 2 }}>
                DividendMaple is built on the principle that user data should never be
                exposed to the server &mdash; all user inputs are either calculated on
                the client (user) side, or sent to the server via end-to-end encryption.
            </Typography>
            <Alert severity="info" sx={{ mt: 1 }}>
                <AlertTitle>Note</AlertTitle>
                DividendMaple focuses on analysis for long-term investments.  Financial data is updated in batches,
                so expect a lag time of 1-2 days from the latest available information.
            </Alert>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 5 }}>
                How do I use it?
            </Typography>
            <Typography component="p" sx={{ mb: 2 }}>
                First, browse the available tickers on the{' '}
                <Link component="button" type="button" onClick={() => onNavigate('datastore')} sx={{ verticalAlign: 'baseline', fontWeight: 'bold' }}>
                    Datastore
                </Link>{' '}
                page to see what is available.
            </Typography>
            <Typography component="p" sx={{ mb: 0 }}>
                Then, create a CSV file describing the
                symbols and quantities to analyze, and submit it on the{' '}
                <Link component="button" type="button" onClick={() => onNavigate('clientSideReport')} sx={{ verticalAlign: 'baseline', fontWeight: 'bold' }}>
                    Client-Side Report
                </Link>{' '}
                page.
            </Typography>
            <Alert severity="info">
                <AlertTitle>Note</AlertTitle>
                The submitted CSV file is never sent to the server.  It is only used to populate portfolio
                values, and all calculations are performed locally in your browser.
            </Alert>

            <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 5 }}>
                For developers: How can I work on it, or host my own?
            </Typography>
            <Typography component="p" sx={{ mb: 2 }}>
                DividendMaple is built on two main components: a batching component and
                the web app. To host your own instance, download the source code from the
                GitHub repositories referenced below, run the batch job to populate your
                datastore, then start the web app locally in Docker.
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
                1.{' '}
                <Link href={FINCOL_URL} target="_blank" rel="noopener noreferrer">
                    Fincol
                </Link>{' '}
                &mdash; the batching component
            </Typography>
            <Typography component="p" sx={{ mb: 2 }}>
                Fincol populates the DividendMaple datastore with financial data, and
                calculates various metrics and aggregations. It runs on an automated
                schedule during trading days. See the{' '}
                <Link href={FINCOL_URL} target="_blank" rel="noopener noreferrer">
                    Fincol GitHub page
                </Link>{' '}
                for source code and documentation.
            </Typography>

            <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>
                2.{' '}
                <Link href={STOCKO_URL} target="_blank" rel="noopener noreferrer">
                    Stocko
                </Link>{' '}
                &mdash; the display and interactivity component
            </Typography>
            <Typography component="p" sx={{ mb: 2 }}>
                Stocko is the .NET web app that exposes the stored data to users and
                allows portfolio position upload and portfolio-based reporting. See the{' '}
                <Link href={STOCKO_URL} target="_blank" rel="noopener noreferrer">
                    Stocko GitHub page
                </Link>{' '}
                for source code and documentation.
            </Typography>
        </Box>
    );
}

export default AboutView;
