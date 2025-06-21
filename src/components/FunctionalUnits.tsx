import React from 'react';
import { Zap, Timer, GitBranch } from 'lucide-react';
import { FunctionalUnit } from '../types/tomasulo';

interface FunctionalUnitsProps {
  units: FunctionalUnit[];
}

export const FunctionalUnits: React.FC<FunctionalUnitsProps> = ({ units }) => {
  const getUnitColor = (type: string, busy: boolean, speculative?: boolean) => {
    if (!busy) return 'bg-gray-50 border-gray-200';
    
    let baseColor = '';
    switch (type) {
      case 'ADD': baseColor = 'bg-blue-50 border-blue-300'; break;
      case 'MULT': baseColor = 'bg-purple-50 border-purple-300'; break;
      case 'LOAD': baseColor = 'bg-green-50 border-green-300'; break;
      case 'STORE': baseColor = 'bg-orange-50 border-orange-300'; break;
      case 'BRANCH': baseColor = 'bg-indigo-50 border-indigo-300'; break;
      default: baseColor = 'bg-gray-50 border-gray-200';
    }

    if (speculative) {
      baseColor += ' ring-2 ring-orange-200 ring-opacity-50';
    }

    return baseColor;
  };

  const getUnitIcon = (type: string) => {
    if (type === 'BRANCH') {
      return <GitBranch className="text-indigo-600" size={16} />;
    }
    return <Zap className="text-yellow-600" size={16} />;
  };

  const groupUnits = () => {
    const groups = {
      'Unidades Add/Sub': units.filter(u => u.type === 'ADD'),
      'Unidades Mult/Div': units.filter(u => u.type === 'MULT'),
      'Unidades Load': units.filter(u => u.type === 'LOAD'),
      'Unidades Store': units.filter(u => u.type === 'STORE'),
      'Unidades Branch': units.filter(u => u.type === 'BRANCH')
    };
    return groups;
  };

  const unitGroups = groupUnits();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Zap className="text-yellow-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Unidades Funcionais</h3>
      </div>
      
      <div className="space-y-4">
        {Object.entries(unitGroups).map(([groupName, groupUnits]) => (
          groupUnits.length > 0 && (
            <div key={groupName} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600 border-b border-gray-200 pb-1">
                {groupName}
              </h4>
              
              <div className="grid gap-2">
                {groupUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${getUnitColor(unit.type, unit.busy, unit.speculative)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getUnitIcon(unit.type)}
                        <span className="font-mono text-sm font-semibold">
                          {unit.name}
                        </span>
                        {unit.busy && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Executando
                          </span>
                        )}
                        {unit.speculative && (
                          <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                            Especulativo
                          </span>
                        )}
                        {unit.remaining && unit.remaining > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Timer size={12} />
                            <span>{unit.remaining} ciclos</span>
                          </div>
                        )}
                      </div>
                      
                      {unit.operation && (
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {unit.operation}
                        </span>
                      )}
                    </div>
                    
                    {unit.busy && unit.instruction ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Instrução:</span>
                          <code className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                            {unit.type === 'BRANCH' 
                              ? `${unit.instruction.operation} ${unit.instruction.src1}, ${unit.instruction.src2}, ${unit.instruction.target}`
                              : unit.instruction.operation === 'LD'
                              ? `LD ${unit.instruction.dest}, ${unit.instruction.address}`
                              : unit.instruction.operation === 'ST'
                              ? `ST ${unit.instruction.src1}, ${unit.instruction.address}`
                              : `${unit.instruction.operation} ${unit.instruction.dest}, ${unit.instruction.src1}, ${unit.instruction.src2}`
                            }
                          </code>
                        </div>
                        
                        {unit.sourceStation && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Origem:</span>
                            <span className="ml-2 font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {unit.sourceStation}
                            </span>
                          </div>
                        )}

                        {unit.speculative && unit.speculationId && (
                          <div className="text-xs text-orange-600">
                            <span className="font-medium">Especulação:</span>
                            <span className="ml-2 font-mono bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              #{unit.speculationId}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-2">
                        Livre
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-lg bg-gray-200 border border-gray-300"></div>
          <span>Livre</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-lg bg-red-200 border border-red-300"></div>
          <span>Executando</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-lg bg-orange-200 border border-orange-300"></div>
          <span>Especulativo</span>
        </div>
      </div>
    </div>
  );
};