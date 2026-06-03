import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { TelemetryTable } from './components/TelemetryTable';
import { TrendsChart } from './components/TrendsChart';
import { ExecHub } from './components/ExecHub';
import { ApprovalQueue } from './components/ApprovalQueue';
import { Simulator } from './components/Simulator';
import { FailureDiagnostics } from './components/FailureDiagnostics';

function App() {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: api.getTestStats });
  const { data: telemetry } = useQuery({ queryKey: ['telemetry'], queryFn: api.getTelemetryLogs });

  return (
    <>
      <div className="glow-bg-1"></div>
      <div className="glow-bg-2"></div>

      <div className="app-container">
        <Header />
        
        <main className="dashboard-grid">
          <section className="left-column">
            <ExecHub />
            <Simulator />
            <ApprovalQueue />
          </section>

          <section className="right-column">
            <StatsGrid stats={stats} />
            <TrendsChart />
            <FailureDiagnostics />
            <TelemetryTable logs={telemetry || []} />
          </section>
        </main>
      </div>
    </>
  );
}

export default App;
