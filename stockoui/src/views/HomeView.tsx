import { Alert, AlertTitle, Box, Link, Typography } from "@mui/material";
import dividendMapleLogo from "../assets/dividendmaple.svg";
import type { View } from "../App";

interface HomeViewProps {
    onNavigate: (view: View) => void;
}

function HomeView({ onNavigate }: HomeViewProps) {
    return (
        <div
            className="home-view"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "min(72vh, 640px)",
                gap: "1.75rem",
                textAlign: "center",
            }}
        >
            <h1 style={{ margin: 0 }}>Welcome to DividendMaple</h1>
            <p>Use the navigation pane on the left to navigate.</p>
            <img
                src={dividendMapleLogo}
                alt="DividendMaple"
                width={400}
                height={400}
                style={{
                    width: "min(400px, 72vw)",
                    height: "auto",
                }}
                decoding="async"
            />

            <Box sx={{ width: "min(640px, 90vw)", textAlign: "left" }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <AlertTitle sx={{ fontWeight: "bold" }}>Warning</AlertTitle>
                    DividendMaple is a pre-alpha proof-of-concept project. Verify all
                    information before relying on it to make investment decisions.
                </Alert>

                <Typography variant="h6" component="h2" gutterBottom>
                    Quick start
                </Typography>
                <Box component="ol" sx={{ pl: 3, m: 0, "& li": { mb: 1.5 } }}>
                    <li>
                        Use the{" "}
                        <Link component="button" type="button" onClick={() => onNavigate("datastore")} sx={{ verticalAlign: "baseline", fontWeight: "bold" }}>
                            Datastore
                        </Link>{" "}
                        view to browse available tickers.
                    </li>
                    <li>
                        Use the{" "}
                        <Link component="button" type="button" onClick={() => onNavigate("clientSideReport")} sx={{ verticalAlign: "baseline", fontWeight: "bold" }}>
                            Client-Side Report
                        </Link>{" "}
                        to see a report based on
                        your portfolio quantities and symbols (don't worry &mdash; no data
                        ever leaves your computer, all calculations are done in your client
                        browser).
                    </li>
                    <li>
                        Click on{" "}
                        <Link component="button" type="button" onClick={() => onNavigate("about")} sx={{ verticalAlign: "baseline", fontWeight: "bold" }}>
                            About
                        </Link>{" "}
                        to learn more about DividendMaple.
                    </li>
                </Box>
            </Box>
        </div>
    );
}

export default HomeView;
