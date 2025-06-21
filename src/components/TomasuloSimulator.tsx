import React, { useState, useEffect, useCallback } from 'react';
import { TomasuloEngine } from '../utils/tomasuloEngine';
import { Instruction, SimulationStep, ProcessorConfig } from '../types/tomasulo';
import { examplePrograms } from '../data/examples';
import { Controls } from './Controls';
import { InstructionQueue } from './InstructionQueue';
import { ReservationStations } from './ReservationStations';
import { FunctionalUnits } from './FunctionalUnits';
import { RegisterStatus } from './RegisterStatus';
import { ReorderBuffer } from './ReorderBuffer';
import { BranchPredictor } from './BranchPredictor';
import { CodeEditor } from './CodeEditor';
import PerformanceMetrics from './PerformanceMetrics';

export const TomasuloSimulator: React.FC = () => {
  const [engine, setEngine] = useState<TomasuloEngine>(new TomasuloEngine(examplePrograms.demonstraRenomeacaoEPredicao));
  const [currentState, setCurrentState] = useState(engine.getState());
  const [history, setHistory] = useState<SimulationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [currentAction, setCurrentAction] = useState<string>('');

  const updateState = useCallback(() => {
    setCurrentState(engine.getState());
    setHistory(engine.getHistory());
  }, [engine]);

  useEffect(() => {
    updateState();
  }, [updateState]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning && !currentState.completed) {
      interval = setInterval(() => {
        const step = engine.step();
        if (step) {
          setCurrentAction(step.action);
          updateState();
          setCurrentStep(engine.getHistory().length - 1);
        } else {
          setIsRunning(false);
        }
      }, speed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentState.completed, speed, engine, updateState]);

  const handlePlay = () => {
    if (!currentState.completed) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStep = () => {
    if (!isRunning && !currentState.completed) {
      const step = engine.step();
      if (step) {
        setCurrentAction(step.action);
        updateState();
        setCurrentStep(engine.getHistory().length - 1);
      }
    }
  };

  const handleBack = () => {
    if (!isRunning && currentStep > -1) {
      setCurrentStep(currentStep - 1);
      const targetState = currentStep === 0 
        ? engine.getState() 
        : history[currentStep - 1]?.state;
      
      if (targetState) {
        setCurrentState(targetState);
        setCurrentAction(currentStep === 0 ? '' : history[currentStep - 1]?.action || '');
      }
    }
  };

  const handleReset = () => {
    if (!isRunning) {
      const newEngine = new TomasuloEngine(currentState.instructions, currentState.config);
      setEngine(newEngine);
      setCurrentState(newEngine.getState());
      setHistory([]);
      setCurrentStep(-1);
      setCurrentAction('');
    }
  };

  const handleLoadProgram = (instructions: Instruction[]) => {
    if (!isRunning) {
      const newEngine = new TomasuloEngine(instructions, currentState.config);
      setEngine(newEngine);
      setCurrentState(newEngine.getState());
      setHistory([]);
      setCurrentStep(-1);
      setCurrentAction('');
      setIsRunning(false);
    }
  };

  const handleConfigChange = (config: Partial<ProcessorConfig>) => {
    if (!isRunning) {
      engine.updateConfig(config);
      updateState();
    }
  };

  const canStep = !currentState.completed;
  const canGoBack = currentStep > -1 && !isRunning;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">
            Simulador Visual do Algoritmo de Tomasulo com Especulação
          </h1>
          <p className="text-gray-600">
            Aprenda como funciona o escalonamento dinâmico com predição de desvios e execução especulativa
          </p>
          <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-3xl mx-auto">
            <strong>Pipeline Especulativo:</strong> Issue → Predição → Reservation Stations → Dispatch → 
            Unidades Funcionais → Write Results → Resolução de Desvios → Commit/Flush
          </div>
          
          {currentAction && (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              <span className="font-medium">Ação atual:</span>
              <span>{currentAction}</span>
            </div>
          )}

          {currentState.speculation.mispredictionRecovery && (
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg animate-pulse">
              <span className="font-medium">⚠️ Recuperação de Mispredição em Andamento</span>
            </div>
          )}
        </div>

        <Controls
          isRunning={isRunning}
          canStep={canStep}
          canGoBack={canGoBack}
          onPlay={handlePlay}
          onPause={handlePause}
          onStep={handleStep}
          onBack={handleBack}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={setSpeed}
          config={currentState.config}
          onConfigChange={handleConfigChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <CodeEditor onLoadProgram={handleLoadProgram} />
            <InstructionQueue 
              instructions={currentState.instructions} 
              currentCycle={currentState.cycle}
            />
            <BranchPredictor 
              predictor={currentState.branchPredictor}
              speculation={currentState.speculation}
              statistics={currentState.statistics}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ReservationStations stations={currentState.reservationStations} />
              <FunctionalUnits units={currentState.functionalUnits} />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <RegisterStatus registers={currentState.registerStatus} />
              <ReorderBuffer entries={currentState.reorderBuffer} />
            </div>
          </div>
        </div>

        {currentState.completed && (
          <>
            <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                🎉 Simulação Concluída!
              </h3>
              <p className="text-green-700 mb-3">
                Todas as instruções foram executadas com sucesso em {currentState.cycle} ciclos.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="font-semibold text-gray-700">Instruções Totais</div>
                  <div className="text-lg font-bold text-green-600">{currentState.statistics.totalInstructions}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="font-semibold text-gray-700">Especulativas</div>
                  <div className="text-lg font-bold text-blue-600">{currentState.statistics.speculativeInstructions}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="font-semibold text-gray-700">Mispredições</div>
                  <div className="text-lg font-bold text-red-600">{currentState.statistics.mispredictions}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="font-semibold text-gray-700">Precisão Preditor</div>
                  <div className="text-lg font-bold text-purple-600">
                    {currentState.branchPredictor.accuracy.total > 0 
                      ? (currentState.branchPredictor.accuracy.correct / currentState.branchPredictor.accuracy.total * 100).toFixed(1)
                      : '0.0'}%
                  </div>
                </div>
              </div>
            </div>
            <PerformanceMetrics statistics={currentState.statistics} totalCycles={currentState.cycle} />
          </>
        )}
      </div>
    </div>
  );
};