import React, { useState } from 'react';
import { Code, BookOpen, Play } from 'lucide-react';
import { Instruction } from '../types/tomasulo';
import { examplePrograms, instructionDescriptions } from '../data/examples';

interface CodeEditorProps {
  onLoadProgram: (instructions: Instruction[]) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ onLoadProgram }) => {
  const [selectedExample, setSelectedExample] = useState<string>('branches');
  const [customCode, setCustomCode] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const handleLoadExample = () => {
    const program = examplePrograms[selectedExample];
    if (program) {
      onLoadProgram(program);
    }
  };

  const parseCustomCode = (code: string): Instruction[] => {
    const lines = code.trim().split('\n').filter(line => line.trim());
    const instructions: Instruction[] = [];
    
    lines.forEach((line, index) => {
      const tokens = line.trim().split(/[\s,]+/);
      const operation = tokens[0]?.toUpperCase();
      
      if (['ADD', 'SUB', 'MUL', 'DIV'].includes(operation)) {
        instructions.push({
          id: index,
          operation: operation as any,
          dest: tokens[1],
          src1: tokens[2],
          src2: tokens[3]
        });
      } else if (operation === 'LD') {
        instructions.push({
          id: index,
          operation: 'LD',
          dest: tokens[1],
          address: tokens[2]
        });
      } else if (operation === 'ST') {
        instructions.push({
          id: index,
          operation: 'ST',
          src1: tokens[1],
          address: tokens[2]
        });
      } else if (['BEQ', 'BNE', 'BGT', 'BLT'].includes(operation)) {
        instructions.push({
          id: index,
          operation: operation as any,
          src1: tokens[1],
          src2: tokens[2],
          target: parseInt(tokens[3]) || 0
        });
      }
    });
    
    return instructions;
  };

  const handleLoadCustom = () => {
    if (customCode.trim()) {
      const instructions = parseCustomCode(customCode);
      onLoadProgram(instructions);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Code className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">Editor de Código</h3>
        </div>
        
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <BookOpen size={16} />
          <span>Ajuda</span>
        </button>
      </div>
      
      {showInstructions && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="font-semibold text-indigo-800 mb-2">Instruções Suportadas:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {Object.entries(instructionDescriptions).map(([op, desc]) => (
              <div key={op} className="space-y-1">
                <code className="font-mono text-indigo-700">{op}</code>
                <p className="text-gray-600 text-xs">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Formatos:</strong><br/>
            • Aritméticas: <code>ADD R1, R2, R3</code><br/>
            • Memória: <code>LD R1, 100</code> ou <code>ST R1, 100</code><br/>
            • Desvios: <code>BEQ R1, R2, 5</code> (salta para instrução 5)
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Exemplos Pré-definidos</h4>
          <div className="flex items-center space-x-2">
            <select
              value={selectedExample}
              onChange={(e) => setSelectedExample(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="basic">Programa Básico</option>
              <option value="hazards">Dependências (Hazards)</option>
              <option value="complex">Programa Complexo</option>
              <option value="branches">Desvios Condicionais</option>
              <option value="speculation">Especulação Avançada</option>
              <option value="demonstraRenomeacaoEPredicao">Renomeação e Predição (Demo)</option>
              <option value="renomeacaoAlwaysTaken">Renomeação Always Taken (Demo)</option>
            </select>
            
            <button
              onClick={handleLoadExample}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Play size={16} />
              <span>Carregar</span>
            </button>
          </div>
          
          <div className="mt-2 p-3 bg-gray-50 rounded border font-mono text-sm max-h-32 overflow-y-auto">
            {examplePrograms[selectedExample]?.map((inst, index) => (
              <div key={index} className="text-gray-700">
                {inst.operation === 'LD' 
                  ? `LD ${inst.dest}, ${inst.address}`
                  : inst.operation === 'ST'
                  ? `ST ${inst.src1}, ${inst.address}`
                  : ['BEQ', 'BNE', 'BGT', 'BLT'].includes(inst.operation)
                  ? `${inst.operation} ${inst.src1}, ${inst.src2}, ${inst.target}`
                  : `${inst.operation} ${inst.dest}, ${inst.src1}, ${inst.src2}`
                }
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Código Personalizado</h4>
          <textarea
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="Digite seu código assembly aqui...&#10;Exemplo:&#10;LD R1, 100&#10;LD R2, 104&#10;BGT R1, R2, 5&#10;ADD R3, R1, R2&#10;ST R3, 108"
            className="w-full h-32 border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          
          <button
            onClick={handleLoadCustom}
            disabled={!customCode.trim()}
            className="mt-2 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={16} />
            <span>Executar Código</span>
          </button>
        </div>
      </div>
    </div>
  );
};