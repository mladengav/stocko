import { Alert, AlertTitle, Box } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

function ReportView() {
    return (
        <Box>
            <h1>Server-side Report</h1>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}>
                <Alert
                    severity="warning"
                    icon={<ConstructionIcon fontSize="inherit" />}
                    sx={{ width: 'min(640px, 90vw)', mt: 2 }}
                >
                    <AlertTitle sx={{ fontWeight: "bold" }}>Under construction</AlertTitle>
                    Server-side reporting could expose personal information to the server.
                    This page will be implemented when end-to-end encryption is added to DividendMaple.
                </Alert>
            </div>
        </Box>
    );
}

export default ReportView;
