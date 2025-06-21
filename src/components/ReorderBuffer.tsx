import React from 'react';
import { List, CheckCircle, Clock, GitBranch, Zap } from 'lucide-react';
import { ReorderBufferEntry } from '../types/tomasulo';

interface ReorderBufferProps {
  entries: ReorderBufferEntry[];
}

export const ReorderBuffer: React.FC<ReorderBufferProps> = ({ entries }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <List className="text-purple-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Reorder Buffer</h3>
      </div>
      
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <List size={48} className="mx-auto mb-2 opacity-30" />
          <p>Nenhuma instrução no buffer</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                entry.committed
                  ? 'bg-green-50 border-green-300'
                  : entry.ready
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200'
              } ${entry.speculative ? 'ring-2 ring-orange-200 ring-opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {entry.committed ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : entry.ready ? (
                      entry.isBranch ? (
                        <GitBranch size={16} className="text-purple-500" />
                      ) : (
                        <Clock size={16} className="text-blue-500" />
                      )
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    )}
                    
                    <span className="text-sm font-medium text-gray-600">
                      #{index}
                    </span>

                    {entry.isBranch && (
                      <div className="flex items-center space-x-1">
                        <GitBranch size={12} className="text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">Branch</span>
                      </div>
                    )}

                    {entry.speculative && (
                      <div className="flex items-center space-x-1">
                        <Zap size={12} className="text-orange-600" />
                        <span className="text-xs text-orange-600 font-medium">
                          Spec #{entry.speculationId}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {entry.instruction}
                  </code>
                </div>
                
                <div className="flex items-center space-x-3 text-xs">
                  {entry.destination && (
                    <div className="space-y-1">
                      <div className="text-gray-500">Dest</div>
                      <div className="font-mono bg-white px-2 py-1 rounded border">
                        {entry.destination}
                      </div>
                    </div>
                  )}
                  
                  {entry.value !== undefined && (
                    <div className="space-y-1">
                      <div className="text-gray-500">
                        {entry.isBranch ? 'Taken' : 'Valor'}
                      </div>
                      <div className="font-mono bg-white px-2 py-1 rounded border">
                        {entry.isBranch 
                          ? (entry.branchTaken ? 'Yes' : 'No')
                          : entry.value
                        }
                      </div>
                    </div>
                  )}

                  {entry.isBranch && entry.branchTarget !== undefined && (
                    <div className="space-y-1">
                      <div className="text-gray-500">Target</div>
                      <div className="font-mono bg-white px-2 py-1 rounded border">
                        {entry.branchTarget}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className="text-gray-500">Status</div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.committed
                        ? 'bg-green-100 text-green-800'
                        : entry.ready
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.committed ? 'Committed' : entry.ready ? 'Ready' : 'Executing'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span>Executando</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock size={12} className="text-blue-500" />
          <span>Pronto</span>
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
          <span>Committed</span>
        </div>
      </div>
    </div>
  );
};