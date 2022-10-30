type ToWasmQuantumCircuitStep<QuantumGate> = QuantumGate[];
type ToWasmQuantumCircuitData<QuantumGate> = ToWasmQuantumCircuitStep<QuantumGate>[];

// observable

type ToWasmObservableData<GateType> = ToWasmObservableStep<GateType>[];

type ToWasmObservableStep<GateType> = {
    operators: GateType[];
    coefficient: number;
};

interface ToWasmCalcStateInfo<GateType, QuantumGate> {
    circuitInfo: {
        circuit: ToWasmQuantumCircuitData<QuantumGate>,
        size: number
    },
    observableInfo: {
        observable: ToWasmObservableData<GateType>
    }
}
