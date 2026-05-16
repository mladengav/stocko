import { useState } from 'react';
import './App.css';
import HomeView from './views/HomeView';
import DatastoreView from './views/DatastoreView';
import ReportView from './views/ReportView';
import ClientSideReportView from './views/ClientSideReportView';

type View = 'home' | 'datastore' | 'report' | 'clientSideReport';

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
            </nav>
            <main className="app-content">
                {view === 'home' && <HomeView />}
                {view === 'datastore' && <DatastoreView />}
                {view === 'clientSideReport' && <ClientSideReportView />}
                {view === 'report' && <ReportView />}
                
            </main>
        </div>
    );
}

export default App;
