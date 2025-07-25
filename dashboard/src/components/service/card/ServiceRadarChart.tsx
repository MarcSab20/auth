"use client";
import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

export interface Criterion {
    key: string;
    label: string;
    value: number;         // 0–100 pour le radar
    votesTotal: number;
    votesLastMonth: number;
  }
  
  export const SERVICE_CRITERIA: Criterion[] = [
    { key: 'pro',  label: 'Professionnalisme', value: 85, votesTotal: 120, votesLastMonth: 15 },
    { key: 'pon',  label: 'Ponctualité',       value: 70, votesTotal: 95,  votesLastMonth: 10 },
    { key: 'com',  label: 'Communication',     value: 90, votesTotal: 110, votesLastMonth: 25 },
    { key: 'qua',  label: 'Qualité',           value: 75, votesTotal: 80,  votesLastMonth: 8  },
    { key: 'pri',  label: 'Prix',              value: 60, votesTotal: 50,  votesLastMonth: 5  },
    { key: 'sou',  label: 'Souplesse',         value: 80, votesTotal: 70,  votesLastMonth: 12 },
    { key: 'exp',  label: 'Expertise',         value: 95, votesTotal: 140, votesLastMonth: 30 },
  ];

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ServiceRadarChartProps {
  data: Criterion[];
  size?: number;
  color?: string;
  hideLabels?: boolean;
}

const ServiceRadarChart: React.FC<ServiceRadarChartProps> = ({ data, size, color = "rgba(99, 102, 241, 1)", hideLabels }) => {
  const labels = data.map((c) => c.label);
  const values = data.map((c) => c.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Notes",
        data: values,
        backgroundColor: color === "black" ? "rgba(0,0,0,0.2)" : color === "red" ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.2)",
        borderColor: color,
        borderWidth: 2,
        pointBackgroundColor: color,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { color: "#e5e7eb" },
        grid:       { color: "#e5e7eb" },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks:     { display: !hideLabels, stepSize: 20, color: "#6b7280" },
        pointLabels: { display: !hideLabels, color: "#374151", font: { size: 12 } },
      },
    },
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false as const,
  };

  return (
    <div style={{ width: size ?? "90%", height: size ?? "90%" }} className="relative bg-white">
      <Radar data={chartData} options={options} />
    </div>
  );
};

export default ServiceRadarChart; 