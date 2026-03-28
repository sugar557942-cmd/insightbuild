'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TrendBarChartProps {
  labels: string[];
  values: number[];
}

export default function TrendBarChart({ labels, values }: TrendBarChartProps) {
  const colors = [
    '#2a1f00',
    '#3d2d00',
    '#4d3900',
    '#614800',
    '#7a5c00',
    '#997500',
    '#b89000',
    '#FFD700',
  ];

  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderRadius: 4,
        barThickness: 24,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#FFD700',
        bodyColor: '#ffffff',
        borderColor: '#FFD700',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#444444',
          font: {
            size: 10,
          },
          maxRotation: 0,
          autoSkip: false,
        },
      },
      y: {
        grid: {
          color: '#222222',
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '180px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
