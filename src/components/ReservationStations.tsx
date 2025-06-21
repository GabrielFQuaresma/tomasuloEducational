import React from 'react';
import { Cpu, ArrowRight, GitBranch, Zap } from 'lucide-react';
import { ReservationStation } from '../types/tomasulo';

interface ReservationStationsProps {
  stations: ReservationStation[];
}

export const ReservationStations: React.FC<ReservationStationsProps> = ({ stations }) => {
  const getStationType = (stationId: string): 'add' | 'mult' | 'load' | 'store' | 'branch' => {
    if (stationId.startsWith('Add')) return 'add';
    if (stationId.startsWith('Mult')) return 'mult';
    if (stationId.startsWith('Load')) return 'load';
    if (stationId.startsWith('Branch')) return 'branch';
    return 'store';
  };

  const getStationColor = (type: string, busy: boolean, speculative?: boolean) => {
    if (!busy) return 'bg-gray-50 border-gray-200';
    
    let baseColor = '';
    switch (type) {
      case 'add': baseColor = 'bg-blue-50 border-blue-300'; break;
      case 'mult': baseColor = 'bg-purple-50 border-purple-300'; break;
      case 'load': baseColor = 'bg-green-50 border-green-300'; break;
      case 'store': baseColor = 'bg-orange-50 border-orange-300'; break;
      case 'branch': baseColor = 'bg-indigo-50 border-indigo-300'; break;
      default: baseColor = 'bg-gray-50 border-gray-200';
    }

    if (speculative) {
      baseColor += ' ring-2 ring-orange-200 ring-opacity-50';
    }

    return baseColor;
  };

  const formatValue = (value: number | null | undefined, qi: string | null | undefined) => {
    if (qi) return `[${qi}]`;
    if (value !== null && value !== undefined) return value.toString();
    return '-';
  };

  const groupStations = () => {
    const groups = {
      'Estações Add/Sub': stations.filter(s => s.id.startsWith('Add')),
      'Estações Mult/Div': stations.filter(s => s.id.startsWith('Mult')),
      'Estações Load': stations.filter(s => s.id.startsWith('Load')),
      'Estações Store': stations.filter(s => s.id.startsWith('Store')),
      'Estações Branch': stations.filter(s => s.id.startsWith('Branch'))
    };
    return groups;
  };

  const stationGroups = groupStations();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Cpu className="text-blue-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Reservation Stations</h3>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Aguardam operandos e UF livre
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(stationGroups).map(([groupName, groupStations]) => (
          groupStations.length > 0 && (
            <div key={groupName} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600 border-b border-gray-200 pb-1">
                {groupName}
              </h4>
              
              <div className="grid gap-2">
                {groupStations.map((station) => {
                  const type = getStationType(station.id);
                  const operandsReady = (!station.qj || station.vj !== null) && 
                                      (!station.qk || station.vk !== null);
                  const isBranch = type === 'branch';
                  
                  return (
                    <div
                      key={station.id}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${getStationColor(type, station.busy, station.speculative)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-semibold">
                            {station.name}
                          </span>
                          {station.busy && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Ocupada
                            </span>
                          )}
                          {station.speculative && (
                            <div className="flex items-center space-x-1">
                              <Zap size={12} className="text-orange-600" />
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                Spec #{station.speculationId}
                              </span>
                            </div>
                          )}
                          {station.busy && operandsReady && (
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                              <ArrowRight size={12} />
                              <span>Pronta para UF</span>
                            </div>
                          )}
                          {isBranch && (
                            <div className="flex items-center space-x-1">
                              <GitBranch size={12} className="text-indigo-600" />
                              <span className="text-xs text-indigo-600 font-medium">Branch</span>
                            </div>
                          )}
                        </div>
                        
                        {station.operation && (
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {station.operation}
                          </span>
                        )}
                      </div>
                      
                      {station.busy && (
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="space-y-1">
                            <div className="text-gray-500">Dest</div>
                            <div className="font-mono bg-white px-2 py-1 rounded border">
                              {station.dest || '-'}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-gray-500">Vj</div>
                            <div className={`font-mono px-2 py-1 rounded border ${
                              station.qj ? 'bg-yellow-50 text-yellow-800' : 'bg-white'
                            }`}>
                              {formatValue(station.vj, station.qj)}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-gray-500">Vk</div>
                            <div className={`font-mono px-2 py-1 rounded border ${
                              station.qk ? 'bg-yellow-50 text-yellow-800' : 'bg-white'
                            }`}>
                              {formatValue(station.vk, station.qk)}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-gray-500">
                              {isBranch ? 'Target' : 'Address'}
                            </div>
                            <div className="font-mono bg-white px-2 py-1 rounded border">
                              {isBranch && station.instruction?.target !== undefined 
                                ? station.instruction.target 
                                : station.address || '-'}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!station.busy && (
                        <div className="text-xs text-gray-400 text-center py-2">
                          Livre
                        </div>
                      )}
                    </div>
                  );
                })}
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
          <div className="w-3 h-3 rounded-lg bg-yellow-200 border border-yellow-300"></div>
          <span>Aguardando operandos</span>
        </div>
        <div className="flex items-center space-x-1">
          <ArrowRight size={12} className="text-green-600" />
          <span>Pronta para UF</span>
        </div>
        <div className="flex items-center space-x-1">
          <Zap size={12} className="text-orange-600" />
          <span>Especulativo</span>
        </div>
      </div>
    </div>
  );
};