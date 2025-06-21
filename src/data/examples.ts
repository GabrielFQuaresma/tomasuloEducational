import { Instruction } from '../types/tomasulo';

export const examplePrograms: Record<string, Instruction[]> = {
  basic: [
    { id: 0, operation: 'LD', dest: 'R1', address: '100' },
    { id: 1, operation: 'LD', dest: 'R2', address: '104' },
    { id: 2, operation: 'ADD', dest: 'R3', src1: 'R1', src2: 'R2' },
    { id: 3, operation: 'MUL', dest: 'R4', src1: 'R3', src2: 'R1' },
    { id: 4, operation: 'ST', src1: 'R4', address: '108' }
  ],
  hazards: [
    { id: 0, operation: 'LD', dest: 'R1', address: '100' },
    { id: 1, operation: 'ADD', dest: 'R2', src1: 'R1', src2: 'R1' },
    { id: 2, operation: 'SUB', dest: 'R3', src1: 'R2', src2: 'R1' },
    { id: 3, operation: 'MUL', dest: 'R4', src1: 'R3', src2: 'R2' },
    { id: 4, operation: 'DIV', dest: 'R5', src1: 'R4', src2: 'R1' }
  ],
  complex: [
    { id: 0, operation: 'LD', dest: 'R1', address: '100' },
    { id: 1, operation: 'LD', dest: 'R2', address: '104' },
    { id: 2, operation: 'LD', dest: 'R3', address: '108' },
    { id: 3, operation: 'ADD', dest: 'R4', src1: 'R1', src2: 'R2' },
    { id: 4, operation: 'SUB', dest: 'R5', src1: 'R2', src2: 'R3' },
    { id: 5, operation: 'MUL', dest: 'R6', src1: 'R4', src2: 'R5' },
    { id: 6, operation: 'ADD', dest: 'R7', src1: 'R6', src2: 'R1' },
    { id: 7, operation: 'ST', src1: 'R7', address: '112' }
  ],
  branches: [
    { id: 0, operation: 'LD', dest: 'R1', address: '100' },
    { id: 1, operation: 'LD', dest: 'R2', address: '104' },
    { id: 2, operation: 'ADD', dest: 'R3', src1: 'R1', src2: 'R2' },
    { id: 3, operation: 'BEQ', src1: 'R1', src2: 'R2', target: 7 },
    { id: 4, operation: 'MUL', dest: 'R4', src1: 'R3', src2: 'R1' },
    { id: 5, operation: 'SUB', dest: 'R5', src1: 'R4', src2: 'R2' },
    { id: 6, operation: 'ST', src1: 'R5', address: '108' },
    { id: 7, operation: 'ADD', dest: 'R6', src1: 'R1', src2: 'R3' },
    { id: 8, operation: 'BNE', src1: 'R6', src2: 'R3', target: 11 },
    { id: 9, operation: 'DIV', dest: 'R7', src1: 'R6', src2: 'R1' },
    { id: 10, operation: 'ST', src1: 'R7', address: '112' },
    { id: 11, operation: 'LD', dest: 'R0', address: '116' }
  ],
  speculation: [
    { id: 0, operation: 'LD', dest: 'R1', address: '100' },
    { id: 1, operation: 'LD', dest: 'R2', address: '104' },
    { id: 2, operation: 'BGT', src1: 'R1', src2: 'R2', target: 8 },
    { id: 3, operation: 'ADD', dest: 'R3', src1: 'R1', src2: 'R2' },
    { id: 4, operation: 'MUL', dest: 'R4', src1: 'R3', src2: 'R1' },
    { id: 5, operation: 'BLT', src1: 'R4', src2: 'R1', target: 10 },
    { id: 6, operation: 'SUB', dest: 'R5', src1: 'R4', src2: 'R2' },
    { id: 7, operation: 'ST', src1: 'R5', address: '108' },
    { id: 8, operation: 'SUB', dest: 'R6', src1: 'R2', src2: 'R1' },
    { id: 9, operation: 'DIV', dest: 'R7', src1: 'R6', src2: 'R1' },
    { id: 10, operation: 'ADD', dest: 'R0', src1: 'R1', src2: 'R2' }
  ],
  demonstraRenomeacaoEPredicao: [
    { id: 0, operation: 'ADD', dest: 'R1', src1: 'R2', src2: 'R3' },      // R1 = 20 + 30 = 50
    { id: 1, operation: 'ADD', dest: 'R1', src1: 'R1', src2: 'R4' },      // R1 = 50 + 40 = 90
    { id: 2, operation: 'BEQ', src1: 'R0', src2: 'R0', target: 5 },      // Branch sempre tomado. Falha com preditor 'always-not-taken'
    { id: 3, operation: 'SUB', dest: 'R6', src1: 'R1', src2: 'R2' },      // Será flushada
    { id: 4, operation: 'ADD', dest: 'R7', src1: 'R6', src2: 'R3' },      // Será flushada
    { id: 5, operation: 'ADD', dest: 'R0', src1: 'R0', src2: 'R0' },      // Alvo do branch (NOP)
  ],
};

export const instructionDescriptions: Record<string, string> = {
  'ADD': 'Soma dois registradores e armazena o resultado no registrador destino',
  'SUB': 'Subtrai o segundo registrador do primeiro e armazena no destino',
  'MUL': 'Multiplica dois registradores e armazena o resultado no destino',
  'DIV': 'Divide o primeiro registrador pelo segundo e armazena no destino',
  'LD': 'Carrega um valor da memória para um registrador',
  'ST': 'Armazena o valor de um registrador na memória',
  'BEQ': 'Desvia se os dois registradores forem iguais (Branch if Equal)',
  'BNE': 'Desvia se os dois registradores forem diferentes (Branch if Not Equal)',
  'BGT': 'Desvia se o primeiro registrador for maior que o segundo (Branch if Greater Than)',
  'BLT': 'Desvia se o primeiro registrador for menor que o segundo (Branch if Less Than)'
};