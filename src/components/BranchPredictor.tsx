import React from 'react';
import { GitBranch, Target, TrendingUp } from 'lucide-react';
import { BranchPredictor as BranchPredictorType, SpeculationState } from '../types/tomasulo';

interface BranchPredictorProps {
  predictor: BranchPredictorType;
  speculation: SpeculationState;
  statistics: {
    totalInstructions: number;
    speculativeInstructions: number;
    mispredictions: number;
    flushes: number;
  };
}

export const BranchPredictor: React.FC<BranchPredictorProps> = ({ 
  predictor, 
  speculation, 
  statistics 
}) => {
  const accuracy = predictor.accuracy.total > 0 
    ? (predictor.accuracy.correct / predictor.accuracy.total * 100).toFixed(1)
    : '0.0';

  const speculationRate = statistics.totalInstructions > 0
    ? (statistics.speculativeInstructions / statistics.totalInstructions * 100).toFixed(1)
    : '0.0';

  const getPredictorDescription = () => {
    switch (predictor.type) {
      case 'always-taken':
        return 'Sempre prediz que desvios serão tomados';
      case 'always-not-taken':
        return 'Sempre prediz que desvios NÃO serão tomados';
      case '2-bit-counter':
        return 'Usa contadores de 2 bits para cada endereço de desvio';
      default:
        return 'Preditor desconhecido';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <GitBranch className="text-purple-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Preditor de Desvios</h3>
        <div className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded">
          {predictor.type}
        </div>
      </div>

      <div className="space-y-4">
        {/* Predictor Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-sm text-purple-800 mb-2">
            <strong>Estratégia:</strong> {getPredictorDescription()}
          </div>
          
          {predictor.type === '2-bit-counter' && (
            <div className="text-xs text-purple-600">
              <strong>Estados:</strong> 00=Strongly NT, 01=Weakly NT, 10=Weakly T, 11=Strongly T
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Target size={16} className="text-green-600" />
              <span className="text-xs font-medium text-green-700">Precisão</span>
            </div>
            <div className="text-lg font-bold text-green-800">{accuracy}%</div>
            <div className="text-xs text-green-600">
              {predictor.accuracy.correct}/{predictor.accuracy.total}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Especulação</span>
            </div>
            <div className="text-lg font-bold text-blue-800">{speculationRate}%</div>
            <div className="text-xs text-blue-600">
              {statistics.speculativeInstructions}/{statistics.totalInstructions}
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-xs font-medium text-red-700 mb-1">Mispredições</div>
            <div className="text-lg font-bold text-red-800">{statistics.mispredictions}</div>
            <div className="text-xs text-red-600">erros</div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="text-xs font-medium text-orange-700 mb-1">Flushes</div>
            <div className="text-lg font-bold text-orange-800">{statistics.flushes}</div>
            <div className="text-xs text-orange-600">pipeline</div>
          </div>
        </div>

        {/* Active Speculations */}
        {speculation.activeSpeculations.size > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600 border-b border-gray-200 pb-1">
              Especulações Ativas
            </h4>
            
            {Array.from(speculation.activeSpeculations.entries()).map(([id, spec]) => (
              <div key={id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-medium text-yellow-800">
                      Especulação #{id}
                    </div>
                    <div className="text-yellow-600">
                      Branch PC: {spec.branchPC} → Predição: {spec.predicted ? 'Tomado' : 'Não Tomado'}
                    </div>
                  </div>
                  <div className="text-yellow-700 font-mono">
                    {spec.instructions.length} inst.
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recovery State */}
        {speculation.mispredictionRecovery && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Recuperação de Mispredição</span>
            </div>
            <div className="text-xs text-red-600 mt-1">
              Fazendo flush do pipeline e restaurando PC para {speculation.recoveryPC}
            </div>
          </div>
        )}

        {/* 2-bit Counter Details */}
        {predictor.type === '2-bit-counter' && predictor.counters.size > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600 border-b border-gray-200 pb-1">
              Contadores por PC
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Array.from(predictor.counters.entries()).map(([pc, counter]) => {
                const states = ['Strongly NT', 'Weakly NT', 'Weakly T', 'Strongly T'];
                const colors = ['bg-red-100 text-red-800', 'bg-orange-100 text-orange-800', 
                               'bg-yellow-100 text-yellow-800', 'bg-green-100 text-green-800'];
                
                return (
                  <div key={pc} className={`p-2 rounded text-xs text-center ${colors[counter]}`}>
                    <div className="font-mono font-bold">PC {pc}</div>
                    <div className="text-xs">{states[counter]}</div>
                    <div className="font-mono">({counter})</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};