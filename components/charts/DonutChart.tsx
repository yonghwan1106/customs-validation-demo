'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: Array<{
    level: string;
    count: number;
    color: string;
  }>;
  title: string;
  height?: number;
}

export default function DonutChart({ data, title, height = 300 }: DonutChartProps) {
  const chartData = {
    labels: data.map(item => {
      const labels = {
        low: '낮음',
        medium: '중간',
        high: '높음'
      };
      return labels[item.level as keyof typeof labels] || item.level;
    }),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
        cutout: '65%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e2e8f0',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
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
            const total = context.dataset.data.reduce((sum: number, value: any) => sum + value, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${context.label}: ${context.parsed}건 (${percentage}%)`;
          }
        }
      },
    },
    elements: {
      arc: {
        hoverBackgroundColor: data.map(item => item.color),
      },
    },
  };

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalCount}</div>
          <div className="text-sm text-blue-200">총 검증</div>
        </div>
      </div>
    </div>
  );
}