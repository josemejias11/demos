import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { api } from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export function TrendsChart() {
  const { data: trends, isLoading, isError } = useQuery({ queryKey: ['trends'], queryFn: api.getTrends });

  if (isLoading) return <div>Loading trends...</div>;
  if (isError || !trends) return <div>Error loading trends</div>;

  const data = {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'Pass Rate (%)',
        data: trends.map(t => t.passRate),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'MotoSans', size: 13 },
        bodyFont: { family: 'MotoSans', size: 14, weight: 'bold' as const },
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y}% Pass Rate`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'MotoSans', size: 11 }, maxTicksLimit: 6 }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { color: '#64748b', font: { family: 'MotoSans', size: 11 }, padding: 10, stepSize: 10 },
        min: 50,
        max: 100
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="card trends-card" style={{ marginTop: '20px' }}>
      <div className="card-header telemetry-header-row">
        <div className="header-title-wrapper">
          <svg className="card-icon text-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <h2>Historical Trends <span className="badge-count" style={{ background: 'var(--blue-glow)', color: 'var(--blue)' }}>30 Days</span></h2>
        </div>
      </div>
      <div className="trends-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="chart-container" style={{ position: 'relative', height: '250px', width: '100%' }}>
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
