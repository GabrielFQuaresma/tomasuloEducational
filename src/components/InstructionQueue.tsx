import React from 'react';
import { CheckCircle, Clock, AlertCircle, GitBranch, Zap } from 'lucide-react';
import { Instruction } from '../types/tomasulo';

interface InstructionQueueProps {
  instructions: Instruction[];
  currentCycle: number;
}

export const InstructionQueue: React.FC<InstructionQueueProps> = ({ instructions, currentCycle }) => {
  const getInstructionStatus = (instruction: Instruction) => {
    if (instruction.committed) return 'committed';
    if (instruction.writeResult) return 'writeResult';
    if (instruction.executed) return 'executed';
    if (instruction.issued) return 'issued';
    return 'waiting';
  };

  const getStatusIcon = (status: string, instruction: Instruction) => {
    const isBranch = ['BEQ', 'BNE', 'BGT', 'BLT'].includes(instruction.operation);
    
    switch (status) {
      case 'committed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'writeResult':
      case 'executed':
        return isBranch ? <GitBranch size={16} className="text-purple-500" /> : <Clock size={16} className="text-blue-500" />;
      case 'issued':
        return <AlertCircle size={16} className="text-yellow-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
    }
  };

  const getStatusColor = (status: string, instruction: Instruction) => {
    const baseColor = (() => {
      switch (status) {
        case 'committed': return 'bg-green-50 border-green-200';
        case 'writeResult': return 'bg-blue-50 border-blue-200';
        case 'executed': return 'bg-purple-50 border-purple-200';
        case 'issued': return 'bg-yellow-50 border-yellow-200';
        default: return 'bg-gray-50 border-gray-200';
      }
    })();

    // Add speculative styling
    if (instruction.speculative) {
      return `${baseColor} ring-2 ring-orange-200 ring-opacity-50`;
    }

    return baseColor;
  };

  const formatInstruction = (instruction: Instruction) => {
    switch (instruction.operation) {
      case 'ADD':
      case 'SUB':
      case 'MUL':
      case 'DIV':
        return `${instruction.operation} ${instruction.dest}, ${instruction.src1}, ${instruction.src2}`;
      case 'LD':
        return `LD ${instruction.dest}, ${instruction.address}`;
      case 'ST':
        return `ST ${instruction.src1}, ${instruction.address}`;
      case 'BEQ':
      case 'BNE':
      case 'BGT':
      case 'BLT':
        return `${instruction.operation} ${instruction.src1}, ${instruction.src2}, ${instruction.target}`;
      default:
        return instruction.operation;
    }
  };

  const isBranchInstruction = (instruction: Instruction) => {
    return ['BEQ', 'BNE', 'BGT', 'BLT'].includes(instruction.operation);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Fila de Instruções</h3>
        <div className="text-sm text-gray-600">Ciclo: {currentCycle}</div>
      </div>
      
      <div className="space-y-2">
        {instructions.map((instruction, index) => {
          const status = getInstructionStatus(instruction);
          const isBranch = isBranchInstruction(instruction);
          
          return (
            <div
              key={instruction.id}
              className={`p-3 rounded-lg border-2 transition-all duration-300 ${getStatusColor(status, instruction)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status, instruction)}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      #{index}
                    </span>
                    <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {formatInstruction(instruction)}
                    </code>
                    {isBranch && (
                      <div className="flex items-center space-x-1">
                        <GitBranch size={12} className="text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">Branch</span>
                      </div>
                    )}
                    {instruction.speculative && (
                      <div className="flex items-center space-x-1">
                        <Zap size={12} className="text-orange-600" />
                        <span className="text-xs text-orange-600 font-medium">
                          Spec #{instruction.speculationId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {instruction.issued && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Issue: {instruction.issued}
                    </span>
                  )}
                  {instruction.executed && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Exec: {instruction.executed}
                    </span>
                  )}
                  {instruction.writeResult && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Write: {instruction.writeResult}
                    </span>
                  )}
                  {instruction.committed && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      Commit: {instruction.committed}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span>Aguardando</span>
        </div>
        <div className="flex items-center space-x-1">
          <AlertCircle size={12} className="text-yellow-500" />
          <span>Issued</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock size={12} className="text-blue-500" />
          <span>Executando</span>
        </div>
        <div className="flex items-center space-x-1">
          <GitBranch size={12} className="text-purple-500" />
          <span>Branch</span>
        </div>
        <div className="flex items-center space-x-1">
          <Zap size={12} className="text-orange-600" />
          <span>Especulativo</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle size={12} className="text-green-500" />
          <span>Concluído</span>
        </div>
      </div>
    </div>
  );
};