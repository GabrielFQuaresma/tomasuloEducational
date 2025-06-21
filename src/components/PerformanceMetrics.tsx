import React from 'react';
import { TomasuloState } from '../types/tomasulo';

interface PerformanceMetricsProps {
  statistics: TomasuloState['statistics'];
  totalCycles: number;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ statistics, totalCycles }) => (
  <div className="bg-white rounded-lg shadow p-4 mt-4">
    <h2 className="text-lg font-bold mb-2">Métricas de Desempenho</h2>
    <ul className="space-y-1">
      <li><b>Ciclos totais:</b> {totalCycles}</li>
      <li><b>Instruções commitadas:</b> {statistics.totalInstructions}</li>
      <li><b>IPC:</b> {statistics.ipc.toFixed(2)}</li>
      <li><b>Ciclos de bolha:</b> {statistics.bubbles}</li>
      <li><b>Ciclos com commit:</b> {statistics.cyclesWithCommit}</li>
      <li><b>Mispredições:</b> {statistics.mispredictions}</li>
      <li><b>Flushes:</b> {statistics.flushes}</li>
    </ul>
  </div>
);

export default PerformanceMetrics; 