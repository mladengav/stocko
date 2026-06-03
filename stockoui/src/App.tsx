import { useState } from 'react';
import './App.css';
import HomeView from './views/HomeView';
import DatastoreView from './views/DatastoreView';
import ReportView from './views/ReportView';
import ClientSideReportView from './views/ClientSideReportView';
import AboutView from './views/AboutView';

export type View = 'home' | 'datastore' | 'report' | 'clientSideReport' | 'about';

function App() {
    const [view, setView] = useState<View>('home');

    return (
        <div className="app-shell">
            <nav className="app-nav">
                <button
                    className={view === 'home' ? 'active' : ''}
                    onClick={() => setView('home')}
                >
                    Home
                </button>
                <button
                    className={view === 'datastore' ? 'active' : ''}
                    onClick={() => setView('datastore')}
                >
                    Datastore
                </button>
                <button
                    className={view === 'clientSideReport' ? 'active' : ''}
                    onClick={() => setView('clientSideReport')}
                >
                    Client-Side Report
                </button>
                <button
                    className={view === 'report' ? 'active' : ''}
                    onClick={() => setView('report')}
                >
                    Report
                </button>
                <button
                    className={view === 'about' ? 'active' : ''}
                    onClick={() => setView('about')}
                >
                    About
                </button>
            </nav>
            <main className="app-content">
                {view === 'home' && <HomeView onNavigate={setView} />}
                {view === 'datastore' && <DatastoreView />}
                {view === 'clientSideReport' && <ClientSideReportView />}
                {view === 'report' && <ReportView />}
                {view === 'about' && <AboutView onNavigate={setView} />}

            </main>
        </div>
    );
}

export default App;
