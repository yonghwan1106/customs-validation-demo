'use client';

import React from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: Array<{
    name: string;
    validations: number;
    percentage?: number;
  }>;
  title: string;
  height?: number;
  color?: string;
}

export default function BarChart({ 
  data, 
  title, 
  height = 300,
  color = '#8b5cf6'
}: BarChartProps) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: '검증 건수',
        data: data.map(item => item.validations),
        backgroundColor: data.map((_, index) => {
          const opacity = 0.8 - (index * 0.15);
          return `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        }),
        borderColor: color,
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 12,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const item = data[context.dataIndex];
            return `${item.name}: ${item.validations}건${item.percentage ? ` (${item.percentage}%)` : ''}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
          },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
      },
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}