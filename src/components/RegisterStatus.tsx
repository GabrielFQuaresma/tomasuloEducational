import React from 'react';
import { Database } from 'lucide-react';
import { RegisterStatus as RegisterStatusType } from '../types/tomasulo';

interface RegisterStatusProps {
  registers: RegisterStatusType[];
}

export const RegisterStatus: React.FC<RegisterStatusProps> = ({ registers }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="text-green-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Status dos Registradores</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {registers.map((register) => (
          <div
            key={register.register}
            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
              register.qi 
                ? 'bg-yellow-50 border-yellow-300' 
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="font-mono text-sm font-semibold text-gray-700">
                {register.register}
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Valor</div>
                <div className="font-mono text-sm bg-white px-2 py-1 rounded border">
                  {register.value}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Qi</div>
                <div className={`font-mono text-sm px-2 py-1 rounded border ${
                  register.qi 
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                    : 'bg-white'
                }`}>
                  {register.qi || '-'}
                </div>
              </div>
              
              {register.qi && (
                <div className="text-xs text-yellow-600 font-medium">
                  Aguardando
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-lg bg-green-200 border border-green-300"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-lg bg-yellow-200 border border-yellow-300"></div>
          <span>Aguardando resultado</span>
        </div>
      </div>
    </div>
  );
};