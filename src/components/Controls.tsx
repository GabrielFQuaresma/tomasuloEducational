import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Settings, Cpu, GitBranch } from 'lucide-react';
import { ProcessorConfig } from '../types/tomasulo';

interface ControlsProps {
  isRunning: boolean;
  canStep: boolean;
  canGoBack: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onBack: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  config: ProcessorConfig;
  onConfigChange: (config: Partial<ProcessorConfig>) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  canStep,
  canGoBack,
  onPlay,
  onPause,
  onStep,
  onBack,
  onReset,
  speed,
  onSpeedChange,
  config,
  onConfigChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={isRunning ? onPause : onPlay}
            disabled={!canStep && !isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isRunning ? 'Pausar' : 'Executar'}</span>
          </button>
          
          <button
            onClick={onStep}
            disabled={!canStep || isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward size={16} />
            <span>Passo</span>
          </button>
          
          <button
            onClick={onBack}
            disabled={!canGoBack || isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack size={16} />
            <span>Voltar</span>
          </button>
          
          <button
            onClick={onReset}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Settings size={16} className="text-gray-600" />
            <label htmlFor="speed" className="text-sm font-medium text-gray-700">
              Velocidade:
            </label>
            <select
              id="speed"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2000}>Muito Lenta</option>
              <option value={1500}>Lenta</option>
              <option value={1000}>Normal</option>
              <option value={500}>Rápida</option>
              <option value={250}>Muito Rápida</option>
            </select>
          </div>
        </div>
      </div>

      {/* Processor Configuration */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-2 mb-3">
          <Cpu size={16} className="text-indigo-600" />
          <h4 className="text-sm font-semibold text-gray-700">Configuração do Processador</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Issue Width (instruções/ciclo)
            </label>
            <select
              value={config.issueWidth}
              onChange={(e) => onConfigChange({ issueWidth: Number(e.target.value) })}
              disabled={isRunning}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              <option value={1}>1 (Scalar)</option>
              <option value={2}>2 (Dual Issue)</option>
              <option value={4}>4 (Quad Issue)</option>
              <option value={6}>6 (Wide Issue)</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Dispatch Width (RS→UF/ciclo)
            </label>
            <select
              value={config.dispatchWidth}
              onChange={(e) => onConfigChange({ dispatchWidth: Number(e.target.value) })}
              disabled={isRunning}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Commit Width (commits/ciclo)
            </label>
            <select
              value={config.commitWidth}
              onChange={(e) => onConfigChange({ commitWidth: Number(e.target.value) })}
              disabled={isRunning}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Profundidade Especulação
            </label>
            <select
              value={config.speculationDepth}
              onChange={(e) => onConfigChange({ speculationDepth: Number(e.target.value) })}
              disabled={isRunning}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
            >
              <option value={2}>2 níveis</option>
              <option value={4}>4 níveis</option>
              <option value={8}>8 níveis</option>
            </select>
          </div>
        </div>

        {/* Branch Predictor Configuration */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <GitBranch size={16} className="text-purple-600" />
            <h4 className="text-sm font-semibold text-gray-700">Preditor de Desvios</h4>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Tipo de Preditor
            </label>
            <select
              value={config.branchPredictorType}
              onChange={(e) => onConfigChange({ branchPredictorType: e.target.value as any })}
              disabled={isRunning}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="always-taken">Sempre Tomado</option>
              <option value="always-not-taken">Sempre Não Tomado</option>
              <option value="2-bit-counter">Contador 2-bit (Adaptativo)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 bg-indigo-50 border border-indigo-200 rounded p-2">
          <strong>Configuração atual:</strong> {config.issueWidth}-way issue, {config.dispatchWidth}-way dispatch, {config.commitWidth}-way commit, {config.branchPredictorType} predictor
          {config.issueWidth > 1 && <span className="text-indigo-600 font-medium"> (Superscalar com Especulação)</span>}
        </div>
      </div>
    </div>
  );
};