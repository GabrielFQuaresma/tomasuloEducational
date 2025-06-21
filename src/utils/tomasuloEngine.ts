import { Instruction, ReservationStation, FunctionalUnit, RegisterStatus, ReorderBufferEntry, TomasuloState, SimulationStep, ProcessorConfig, BranchPredictor, SpeculationState } from '../types/tomasulo';
import PerformanceMetrics from '../components/PerformanceMetrics';

export class TomasuloEngine {
  private state: TomasuloState;
  private history: SimulationStep[] = [];
  private executionTimes: Record<string, number> = {
    'ADD': 2,
    'SUB': 2,
    'MUL': 4,
    'DIV': 8,
    'LD': 3,
    'ST': 3,
    'BEQ': 1,
    'BNE': 1,
    'BGT': 1,
    'BLT': 1
  };
  private robIdCounter: number = 0;

  constructor(instructions: Instruction[], config?: Partial<ProcessorConfig>) {
    const defaultConfig: ProcessorConfig = {
      issueWidth: 2,
      commitWidth: 2,
      dispatchWidth: 2,
      branchPredictorType: '2-bit-counter',
      speculationDepth: 4
    };
    
    this.state = this.initializeState(instructions, { ...defaultConfig, ...config });
  }

  private initializeState(instructions: Instruction[], config: ProcessorConfig): TomasuloState {
    const reservationStations: ReservationStation[] = [
      // Add/Sub stations
      { id: 'Add1', name: 'Add1', busy: false },
      { id: 'Add2', name: 'Add2', busy: false },
      { id: 'Add3', name: 'Add3', busy: false },
      // Mul/Div stations
      { id: 'Mult1', name: 'Mult1', busy: false },
      { id: 'Mult2', name: 'Mult2', busy: false },
      // Load/Store stations
      { id: 'Load1', name: 'Load1', busy: false },
      { id: 'Load2', name: 'Load2', busy: false },
      { id: 'Store1', name: 'Store1', busy: false },
      // Branch stations
      { id: 'Branch1', name: 'Branch1', busy: false },
      { id: 'Branch2', name: 'Branch2', busy: false },
    ];

    const functionalUnits: FunctionalUnit[] = [
      // Add/Sub units
      { id: 'AddUnit1', name: 'Add Unit 1', type: 'ADD', busy: false },
      { id: 'AddUnit2', name: 'Add Unit 2', type: 'ADD', busy: false },
      // Mult/Div units
      { id: 'MultUnit1', name: 'Mult Unit 1', type: 'MULT', busy: false },
      // Load/Store units
      { id: 'LoadUnit1', name: 'Load Unit 1', type: 'LOAD', busy: false },
      { id: 'StoreUnit1', name: 'Store Unit 1', type: 'STORE', busy: false },
      // Branch units
      { id: 'BranchUnit1', name: 'Branch Unit 1', type: 'BRANCH', busy: false },
    ];

    const registerStatus: RegisterStatus[] = [];
    for (let i = 0; i < 8; i++) {
      registerStatus.push({
        register: `R${i}`,
        qi: null,
        value: i * 10
      });
    }

    const branchPredictor: BranchPredictor = {
      type: config.branchPredictorType,
      predictions: new Map(),
      counters: new Map(),
      accuracy: { correct: 0, total: 0 }
    };

    const speculation: SpeculationState = {
      activeSpeculations: new Map(),
      nextSpeculationId: 1,
      mispredictionRecovery: false
    };

    return {
      cycle: 0,
      instructions: instructions.map((inst, index) => ({ ...inst, id: index })),
      reservationStations,
      functionalUnits,
      registerStatus,
      reorderBuffer: [],
      pc: 0,
      isRunning: false,
      completed: false,
      config,
      branchPredictor,
      speculation,
      statistics: {
        totalInstructions: 0,
        speculativeInstructions: 0,
        mispredictions: 0,
        flushes: 0,
        cyclesWithCommit: 0,
        bubbles: 0,
        ipc: 0
      }
    };
  }

  public getState(): TomasuloState {
    return { ...this.state };
  }

  public getHistory(): SimulationStep[] {
    return [...this.history];
  }

  public reset(instructions: Instruction[]): void {
    this.state = this.initializeState(instructions, this.state.config);
    this.history = [];
  }

  public updateConfig(config: Partial<ProcessorConfig>): void {
    this.state.config = { ...this.state.config, ...config };
    if (config.branchPredictorType) {
      this.state.branchPredictor.type = config.branchPredictorType;
    }
  }

  public step(): SimulationStep | null {
    if (this.state.completed) return null;

    this.state.cycle++;
    const actions: string[] = [];
    const descriptions: string[] = [];

    // Handle misprediction recovery first
    if (this.state.speculation.mispredictionRecovery) {
      this.handleMispredictionRecovery();
      actions.push('Recovery');
      descriptions.push('Recovering from branch misprediction - flushing speculative instructions');
    } else {
      // Normal pipeline operations
      
      // 1. Try to dispatch multiple instructions from RS to FU
      const dispatched = this.tryMultipleDispatch();
      if (dispatched.length > 0) {
        actions.push('Dispatch');
        descriptions.push(`Dispatched ${dispatched.length} instruction(s): ${dispatched.map(d => `${d.station}→${d.unit}`).join(', ')}`);
      }

      // 2. Try to issue multiple new instructions (with speculation)
      const issued = this.tryMultipleIssueWithSpeculation();
      if (issued.issued > 0) {
        actions.push('Issue');
        let desc = `Issued ${issued.issued} instruction(s)`;
        if (issued.speculative > 0) {
          desc += ` (${issued.speculative} speculative)`;
        }
        descriptions.push(desc);
      }

      // 3. Execute instructions in functional units
      this.executeInFunctionalUnits();

      // 4. Write results and handle branch resolution
      const written = this.writeResults();
      if (written.length > 0) {
        actions.push('Write');
        descriptions.push(`Wrote ${written.length} result(s): ${written.join(', ')}`);
      }

      // 5. Commit multiple instructions
      const committed = this.commitMultipleInstructions();
      if (committed > 0) {
        actions.push('Commit');
        descriptions.push(`Committed ${committed} instruction(s)`);
      }
    }

    // Check if simulation is complete
    if (this.isSimulationComplete()) {
      this.state.completed = true;
      const totalCycles = this.state.cycle;
      const totalInstructions = this.state.statistics.totalInstructions;
      const cyclesWithCommit = this.state.statistics.cyclesWithCommit;
      this.state.statistics.bubbles = totalCycles - cyclesWithCommit;
      this.state.statistics.ipc = totalInstructions / totalCycles;
      actions.push('Complete');
      descriptions.push('Simulation completed successfully');
    }

    const step: SimulationStep = {
      cycle: this.state.cycle,
      state: { ...this.state },
      action: actions.join(' + ') || 'Execute',
      description: descriptions.join(' | ') || `Cycle ${this.state.cycle}: Processing instructions`
    };

    this.history.push(step);
    return step;
  }

  private tryMultipleIssueWithSpeculation(): { issued: number; speculative: number } {
    let issuedCount = 0;
    let speculativeCount = 0;

    while (issuedCount < this.state.config.issueWidth && 
           this.state.pc < this.state.instructions.length) {
      
      const instruction = this.state.instructions[this.state.pc];
      const station = this.findAvailableStation(instruction.operation);

      if (!station) break;

      // Check if we're in speculative execution
      const currentSpeculation = this.getCurrentSpeculation();
      const isSpeculative = currentSpeculation !== null;

      // Handle branch instructions
      if (this.isBranchInstruction(instruction)) {
        const prediction = this.predictBranch(this.state.pc);
        
        if (prediction) {
          const speculationId = this.state.speculation.nextSpeculationId++;
          this.state.speculation.activeSpeculations.set(speculationId, {
            branchPC: this.state.pc,
            predicted: true,
            instructions: []
          });
          instruction.speculationId = speculationId;
          instruction.speculative = true;
          this.state.speculation.activeSpeculations.get(speculationId)?.instructions.push(instruction.id);
        }
      }

      // Create ROB entry
      const robId = (this.robIdCounter++).toString();
      this.state.reorderBuffer.push({
        id: robId,
        instruction: this.formatInstruction(instruction),
        destination: instruction.dest,
        ready: false,
        committed: false,
        instructionId: instruction.id,
        speculative: isSpeculative,
        speculationId: currentSpeculation ?? undefined,
        isBranch: this.isBranchInstruction(instruction),
        branchTarget: instruction.target
      });

      console.log(`[DEBUG] ROB SUB id=${robId} speculationId=${instruction.speculationId}`);

      // Issue to reservation station
      station.busy = true;
      station.operation = instruction.operation;
      station.dest = instruction.dest;
      station.instruction = instruction;
      station.robIndex = robId;
      station.speculative = isSpeculative;
      station.speculationId = instruction.speculationId;

      this.handleOperands(station, instruction);

      // Mark instruction properties
      instruction.issued = this.state.cycle;
      instruction.robIndex = robId;
      instruction.speculative = isSpeculative;
      instruction.speculationId = instruction.speculationId;
      instruction.pc = this.state.pc;

      // Update statistics
      this.state.statistics.totalInstructions++;
      if (isSpeculative) {
        this.state.statistics.speculativeInstructions++;
        speculativeCount++;
      }

      // Add to speculation tracking
      if (currentSpeculation !== null) {
        const spec = this.state.speculation.activeSpeculations.get(currentSpeculation);
        if (spec) {
          spec.instructions.push(instruction.id);
        }
      }

      // Update PC based on branch prediction
      if (this.isBranchInstruction(instruction)) {
        const prediction = this.predictBranch(this.state.pc);
        if (prediction && instruction.target !== undefined) {
          this.state.pc = instruction.target;
        } else {
          this.state.pc++;
        }
      } else {
        this.state.pc++;
      }

      console.log(`[DEBUG] Emitindo instrução ${instruction.operation} id=${instruction.id} speculationId=${instruction.speculationId}`);

      issuedCount++;
    }

    return { issued: issuedCount, speculative: speculativeCount };
  }

  private isBranchInstruction(instruction: Instruction): boolean {
    return ['BEQ', 'BNE', 'BGT', 'BLT'].includes(instruction.operation);
  }

  private predictBranch(pc: number): boolean {
    const predictor = this.state.branchPredictor;
    
    switch (predictor.type) {
      case 'always-taken':
        return true;
      case 'always-not-taken':
        return false;
      case '2-bit-counter':
        const counter = predictor.counters.get(pc) || 1; // Start with weakly not taken
        return counter >= 2;
      default:
        return false;
    }
  }

  private getCurrentSpeculation(): number | null {
    // Return the most recent active speculation
    const speculations = Array.from(this.state.speculation.activeSpeculations.keys());
    return speculations.length > 0 ? Math.max(...speculations) : null;
  }

  private writeResults(): string[] {
    const written: string[] = [];
    this.state.functionalUnits.forEach(unit => {
      if (
        unit.busy &&
        unit.remaining === 0 &&
        unit.instruction &&
        !unit.instruction.writeResult &&
        unit.readyForWriteBack === this.state.cycle // write-back só no ciclo certo
      ) {
        unit.instruction.writeResult = this.state.cycle;
        // Handle branch resolution
        if (this.isBranchInstruction(unit.instruction)) {
          this.resolveBranch(unit);
        } else {
          this.broadcastResult(unit);
        }
        written.push(unit.name);
        this.clearFunctionalUnit(unit);
      }
    });
    return written;
  }

  private resolveBranch(unit: FunctionalUnit): void {
    if (!unit.instruction) return;

    const instruction = unit.instruction;
    const actualTaken = this.evaluateBranch(unit);
    const predictedTaken = this.predictBranch(instruction.pc!);

    // Update branch predictor
    this.updateBranchPredictor(instruction.pc!, actualTaken);

    // Update ROB entry
    if (unit.robIndex !== undefined) {
      const robEntry = this.state.reorderBuffer.find(entry => entry.id === unit.robIndex);
      if (robEntry) {
        robEntry.ready = true;
        robEntry.branchTaken = actualTaken;
      }
    }

    // Check for misprediction
    if (actualTaken !== predictedTaken) {
      this.handleBranchMisprediction(instruction, actualTaken);
    } else {
      // Correct prediction - resolve speculation
      if (instruction.speculationId !== undefined) {
        this.resolveSpeculation(instruction.speculationId, true);
      }
    }

    console.log('[DEBUG] Estado do ROB após resolveSpeculation:', JSON.stringify(this.state.reorderBuffer, null, 2));
  }

  private evaluateBranch(unit: FunctionalUnit): boolean {
    if (!unit.instruction) return false;

    const vj = unit.vj || 0;
    const vk = unit.vk || 0;

    switch (unit.instruction.operation) {
      case 'BEQ': return vj === vk;
      case 'BNE': return vj !== vk;
      case 'BGT': return vj > vk;
      case 'BLT': return vj < vk;
      default: return false;
    }
  }

  private updateBranchPredictor(pc: number, taken: boolean): void {
    const predictor = this.state.branchPredictor;
    predictor.accuracy.total++;

    const predicted = this.predictBranch(pc);
    if (predicted === taken) {
      predictor.accuracy.correct++;
    }

    if (predictor.type === '2-bit-counter') {
      const counter = predictor.counters.get(pc) || 1;
      if (taken) {
        predictor.counters.set(pc, Math.min(3, counter + 1));
      } else {
        predictor.counters.set(pc, Math.max(0, counter - 1));
      }
    }
  }

  private handleBranchMisprediction(instruction: Instruction, actualTaken: boolean): void {
    this.state.statistics.mispredictions++;
    this.state.speculation.mispredictionRecovery = true;
    // Calculate correct PC
    if (actualTaken && instruction.target !== undefined) {
      this.state.speculation.recoveryPC = instruction.target;
    } else {
      this.state.speculation.recoveryPC = instruction.id + 1;
    }
    // Mark speculation for flushing
    if (instruction.speculationId !== undefined) {
      this.resolveSpeculation(instruction.speculationId, false);
    }
    // Passa o id do branch para o recovery
    this.state.speculation.branchFlushInstructionId = instruction.id;
  }

  private resolveSpeculation(speculationId: number, correct: boolean): void {
    const speculation = this.state.speculation.activeSpeculations.get(speculationId);
    if (!speculation) return;

    if (correct) {
      // Atualizar instruções
      speculation.instructions.forEach(instId => {
        const instruction = this.state.instructions.find(i => i.id === instId);
        if (instruction) {
          instruction.speculative = false;
          instruction.speculationId = undefined;
        }
      });
      // Atualizar todas as entradas do ROB com speculationId igual
      this.state.reorderBuffer.forEach(robEntry => {
        if (robEntry.speculationId === speculationId) {
          robEntry.speculative = false;
          robEntry.speculationId = undefined;
        }
      });
    } else {
      // Misprediction - mark for flushing
      this.state.statistics.flushes++;
    }

    this.state.speculation.activeSpeculations.delete(speculationId);

    console.log('[DEBUG] Estado do ROB após resolveSpeculation:', JSON.stringify(this.state.reorderBuffer, null, 2));
  }

  private handleMispredictionRecovery(): void {
    // Flush all instructions emitidas após o branch
    const branchInstructionId = this.state.speculation.branchFlushInstructionId;
    if (branchInstructionId !== undefined) {
      this.flushSpeculativeInstructions(branchInstructionId);
    }
    // Restore PC
    if (this.state.speculation.recoveryPC !== undefined) {
      this.state.pc = this.state.speculation.recoveryPC;
    }
    // Clear recovery state
    this.state.speculation.mispredictionRecovery = false;
    this.state.speculation.recoveryPC = undefined;
    this.state.speculation.branchFlushInstructionId = undefined;
  }

  private flushSpeculativeInstructions(branchInstructionId: number): void {
    // Remove entradas do ROB emitidas após o branch
    this.state.reorderBuffer = this.state.reorderBuffer.filter(entry => entry.instructionId <= branchInstructionId);

    // Limpar estações de reserva
    this.state.reservationStations.forEach(station => {
      if (station.instruction && station.instruction.id > branchInstructionId) {
        this.clearStation(station);
      }
    });

    // Limpar unidades funcionais
    this.state.functionalUnits.forEach(unit => {
      if (unit.instruction && unit.instruction.id > branchInstructionId) {
        this.clearFunctionalUnit(unit);
      }
    });

    // Limpar status dos registradores se necessário
    this.state.registerStatus.forEach(reg => {
      if (reg.qi) {
        const robEntry = this.state.reorderBuffer.find(e => e.id === reg.qi);
        if (!robEntry) {
          reg.qi = null;
          reg.speculative = false;
          reg.speculationId = undefined;
        }
      }
    });

    // Limpar especulações ativas
    this.state.speculation.activeSpeculations.clear();

    // Limpar estado das instruções emitidas após o branch
    this.state.instructions.forEach(inst => {
      if (inst.id > branchInstructionId) {
        inst.issued = undefined;
        inst.executed = undefined;
        inst.writeResult = undefined;
        inst.committed = undefined;
        inst.robIndex = undefined;
        inst.speculative = false;
        inst.speculationId = undefined;
      }
    });
  }

  private tryMultipleDispatch(): { station: string; unit: string }[] {
    const dispatched: { station: string; unit: string }[] = [];
    let dispatchCount = 0;

    for (const station of this.state.reservationStations) {
      if (dispatchCount >= this.state.config.dispatchWidth) break;
      
      if (station.busy && station.instruction) {
        let operandsReady = false;
        if (station.operation === 'LD') {
          operandsReady = true;
        } else if (station.operation === 'ST') {
          operandsReady = (station.qj == null && station.vj !== undefined);
        } else {
          operandsReady = (station.qj == null && station.vj !== undefined) &&
                        (station.qk == null && station.vk !== undefined);
        }
        
        if (operandsReady) {
          const unit = this.findAvailableFunctionalUnit(station.operation!);
          if (unit) {
            unit.busy = true;
            unit.operation = station.operation;
            unit.instruction = station.instruction;
            unit.sourceStation = station.robIndex;
            unit.remaining = this.executionTimes[station.operation!];
            unit.robIndex = station.robIndex;
            unit.speculative = station.speculative;
            unit.speculationId = station.speculationId;
            unit.vj = station.vj;
            unit.vk = station.vk;

            dispatched.push({ station: station.name, unit: unit.name });
            this.clearStation(station);
            dispatchCount++;
          }
        }
      }
    }
    
    return dispatched;
  }

  private findAvailableFunctionalUnit(operation: string): FunctionalUnit | null {
    const unitTypes = {
      'ADD': ['ADD'],
      'SUB': ['ADD'],
      'MUL': ['MULT'],
      'DIV': ['MULT'],
      'LD': ['LOAD'],
      'ST': ['STORE'],
      'BEQ': ['BRANCH'],
      'BNE': ['BRANCH'],
      'BGT': ['BRANCH'],
      'BLT': ['BRANCH']
    };

    const requiredType = unitTypes[operation as keyof typeof unitTypes]?.[0];
    if (!requiredType) return null;

    return this.state.functionalUnits.find(unit => 
      unit.type === requiredType && !unit.busy
    ) || null;
  }

  private findAvailableStation(operation: string): ReservationStation | null {
    const stationTypes = {
      'ADD': ['Add1', 'Add2', 'Add3'],
      'SUB': ['Add1', 'Add2', 'Add3'],
      'MUL': ['Mult1', 'Mult2'],
      'DIV': ['Mult1', 'Mult2'],
      'LD': ['Load1', 'Load2'],
      'ST': ['Store1'],
      'BEQ': ['Branch1', 'Branch2'],
      'BNE': ['Branch1', 'Branch2'],
      'BGT': ['Branch1', 'Branch2'],
      'BLT': ['Branch1', 'Branch2']
    };

    const availableStations = stationTypes[operation as keyof typeof stationTypes] || [];
    
    for (const stationId of availableStations) {
      const station = this.state.reservationStations.find(s => s.id === stationId);
      if (station && !station.busy) {
        return station;
      }
    }

    return null;
  }

  private handleOperands(station: ReservationStation, instruction: Instruction): void {
    if (instruction.src1) {
      const regStatus = this.state.registerStatus.find(r => r.register === instruction.src1);
      if (regStatus) {
        console.log(`[DEBUG] src1: ${instruction.src1}, value: ${regStatus.value}, qi: ${regStatus.qi}`);
        if (regStatus.qi !== null && regStatus.qi !== undefined) {
          station.qj = regStatus.qi;
          station.vj = null;
        } else {
          station.vj = regStatus.value;
          station.qj = null;
        }
      }
    }

    if (instruction.src2) {
      const regStatus = this.state.registerStatus.find(r => r.register === instruction.src2);
      if (regStatus) {
        console.log(`[DEBUG] src2: ${instruction.src2}, value: ${regStatus.value}, qi: ${regStatus.qi}`);
        if (regStatus.qi !== null && regStatus.qi !== undefined) {
          station.qk = regStatus.qi;
          station.vk = null;
        } else {
          station.vk = regStatus.value;
          station.qk = null;
        }
      }
    }

    if (instruction.dest && !this.isBranchInstruction(instruction)) {
      const regStatus = this.state.registerStatus.find(r => r.register === instruction.dest);
      if (regStatus) {
        regStatus.qi = station.robIndex !== undefined ? station.robIndex : null;
        regStatus.speculative = station.speculative;
        regStatus.speculationId = station.speculationId;
      }
    }

    if (instruction.address) {
      station.address = instruction.address;
    }
  }

  private executeInFunctionalUnits(): void {
    this.state.functionalUnits.forEach(unit => {
      if (unit.busy && unit.remaining !== undefined && unit.remaining > 0) {
        unit.remaining--;
        if (unit.remaining === 0 && unit.instruction) {
          unit.instruction.executed = this.state.cycle;
          unit.readyForWriteBack = this.state.cycle + 1; // write-back só no próximo ciclo
        }
      }
    });
  }

  private broadcastResult(unit: FunctionalUnit): void {
    const sourceRobIndex = unit.sourceStation;
    const result = this.calculateResult(unit);

    this.state.reservationStations.forEach(station => {
      if (station.qj === sourceRobIndex) {
        station.vj = result;
        station.qj = null;
      }
      if (station.qk === sourceRobIndex) {
        station.vk = result;
        station.qk = null;
      }
    });

    if (unit.robIndex !== undefined) {
      const robEntry = this.state.reorderBuffer.find(entry => entry.id === unit.robIndex);
      if (robEntry && !robEntry.ready) {
        robEntry.value = result;
        robEntry.ready = true;
      }
    }
  }

  private calculateResult(unit: FunctionalUnit): number {
    if (!unit.instruction) return 0;

    const vj = unit.vj || 0;
    const vk = unit.vk || 0;

    console.log(`[DEBUG] Calculando resultado: ${unit.operation} vj=${vj} vk=${vk}`);

    switch (unit.operation) {
      case 'ADD': return vj + vk;
      case 'SUB': return vj - vk;
      case 'MUL': return vj * vk;
      case 'DIV': return vk !== 0 ? vj / vk : 0;
      case 'LD': return Math.floor(Math.random() * 100);
      case 'ST': return vj;
      default: return 0;
    }
  }

  private clearStation(station: ReservationStation): void {
    station.busy = false;
    station.operation = undefined;
    station.vj = undefined;
    station.vk = undefined;
    station.qj = undefined;
    station.qk = undefined;
    station.dest = undefined;
    station.address = undefined;
    station.instruction = undefined;
    station.robIndex = undefined;
    station.speculative = undefined;
    station.speculationId = undefined;
  }

  private clearFunctionalUnit(unit: FunctionalUnit): void {
    unit.busy = false;
    unit.operation = undefined;
    unit.remaining = undefined;
    unit.instruction = undefined;
    unit.sourceStation = undefined;
    unit.robIndex = undefined;
    unit.speculative = undefined;
    unit.speculationId = undefined;
  }

  private commitMultipleInstructions(): number {
    let committedCount = 0;
    while (
      committedCount < this.state.config.commitWidth &&
      this.state.reorderBuffer.length > 0 &&
      this.state.reorderBuffer[0].ready &&
      !this.state.reorderBuffer[0].committed
    ) {
      const robEntry = this.state.reorderBuffer[0];
      // Don't commit speculative instructions
      if (robEntry.speculative) break;
      // Só commit se writeResult < ciclo atual
      const instruction = this.state.instructions.find(inst => inst.id === robEntry.instructionId);
      if (!instruction || instruction.writeResult === undefined || instruction.writeResult >= this.state.cycle) break;
      if (robEntry.destination && robEntry.value !== undefined) {
        const regStatus = this.state.registerStatus.find(r => r.register === robEntry.destination);
        if (regStatus) {
          regStatus.value = robEntry.value;
          regStatus.qi = null;
          regStatus.speculative = false;
          regStatus.speculationId = undefined;
        }
      }
      robEntry.committed = true;
      if (instruction) {
        instruction.committed = this.state.cycle;
      }
      this.state.reorderBuffer.shift();
      committedCount++;
    }
    if (committedCount > 0) {
      this.state.statistics.cyclesWithCommit++;
    }
    return committedCount;
  }

  private isSimulationComplete(): boolean {
    return this.state.pc >= this.state.instructions.length &&
           this.state.reorderBuffer.length === 0 &&
           this.state.reservationStations.every(station => !station.busy) &&
           this.state.functionalUnits.every(unit => !unit.busy) &&
           !this.state.speculation.mispredictionRecovery;
  }

  private formatInstruction(instruction: Instruction): string {
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
        return `${instruction.operation}`;
    }
  }
}