export interface Instruction {
  id: number;
  operation: 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'LD' | 'ST' | 'BEQ' | 'BNE' | 'BGT' | 'BLT';
  dest?: string;
  src1?: string;
  src2?: string;
  immediate?: number;
  address?: string;
  target?: number; // Branch target address (instruction index)
  issued?: number;
  executed?: number;
  writeResult?: number;
  committed?: number;
  robIndex?: string;
  speculative?: boolean; // Is this instruction speculative?
  speculationId?: number; // Which speculation branch this belongs to
  pc?: number; // Índice da instrução (PC) no momento da emissão
}

export interface ReservationStation {
  id: string;
  name: string;
  busy: boolean;
  operation?: string;
  vj?: number | null;
  vk?: number | null;
  qj?: string | null;
  qk?: string | null;
  dest?: string;
  address?: string;
  instruction?: Instruction;
  robIndex?: string;
  speculative?: boolean;
  speculationId?: number;
}

export interface FunctionalUnit {
  id: string;
  name: string;
  type: 'ADD' | 'MULT' | 'LOAD' | 'STORE' | 'BRANCH';
  busy: boolean;
  operation?: string;
  remaining?: number;
  instruction?: Instruction;
  sourceStation?: string;
  robIndex?: string;
  speculative?: boolean;
  speculationId?: number;
  vj?: number | null; // Operando 1
  vk?: number | null; // Operando 2
  readyForWriteBack?: number;
}

export interface RegisterStatus {
  register: string;
  qi: string | null;
  value: number;
  speculative?: boolean;
  speculationId?: number;
}

export interface ReorderBufferEntry {
  id: string;
  instruction: string;
  destination?: string;
  value?: number;
  ready: boolean;
  committed: boolean;
  instructionId: number;
  speculative?: boolean;
  speculationId?: number;
  isBranch?: boolean;
  branchTaken?: boolean;
  branchTarget?: number;
}

export interface BranchPredictor {
  type: 'always-taken' | 'always-not-taken' | '2-bit-counter';
  predictions: Map<number, boolean>; // PC -> prediction
  counters: Map<number, number>; // For 2-bit counter predictor
  accuracy: {
    correct: number;
    total: number;
  };
}

export interface SpeculationState {
  activeSpeculations: Map<number, {
    branchPC: number;
    predicted: boolean;
    instructions: number[]; // Instruction IDs that are speculative
  }>;
  nextSpeculationId: number;
  mispredictionRecovery: boolean;
  recoveryPC?: number;
  branchFlushInstructionId?: number;
}

export interface ProcessorConfig {
  issueWidth: number;
  commitWidth: number;
  dispatchWidth: number;
  branchPredictorType: 'always-taken' | 'always-not-taken' | '2-bit-counter';
  speculationDepth: number; // Max number of unresolved branches
}

export interface TomasuloState {
  cycle: number;
  instructions: Instruction[];
  reservationStations: ReservationStation[];
  functionalUnits: FunctionalUnit[];
  registerStatus: RegisterStatus[];
  reorderBuffer: ReorderBufferEntry[];
  pc: number;
  isRunning: boolean;
  completed: boolean;
  config: ProcessorConfig;
  branchPredictor: BranchPredictor;
  speculation: SpeculationState;
  statistics: {
    totalInstructions: number;
    speculativeInstructions: number;
    mispredictions: number;
    flushes: number;
    cyclesWithCommit: number;
    bubbles: number;
    ipc: number;
  };
}

export interface SimulationStep {
  cycle: number;
  state: TomasuloState;
  action: string;
  description: string;
}