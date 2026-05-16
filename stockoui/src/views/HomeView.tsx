import dividendMapleLogo from "../assets/dividendmaple.svg";

function HomeView() {
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
            
        </div>
    );
}

export default HomeView;
