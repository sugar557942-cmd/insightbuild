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
  color?: string;
}

export default function TrendBarChart({ labels, values, color = '#FFD700' }: TrendBarChartProps) {
  // Generate shades of the provided color
  const generateShades = (hex: string) => {
    // Basic approach: return original color for all for now, or could do light/dark
    // For simplicity and premium feel, we'll use the main color for the last bar and 
    // a dimmer version for others, similar to the original design
    return labels.map((_, i) => i === labels.length - 1 ? hex : `${hex}33`);
  };

  const backgroundColor = generateShades(color);

  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColor,
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
        titleColor: color,
        bodyColor: '#ffffff',
        borderColor: color,
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
