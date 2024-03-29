import { QulacsWasmModule } from "./emsciptenModule/QulacsWasmModule";
import { Complex } from "./type/common";
import type { CausalConeSimulatorImpl, ClsNoisyEvolution_fast, ClsOneControlOneTargetGate, ClsOneQubitGate, ClsOneQubitRotationGate, ClsReversibleBooleanGate, ClsStateReflectionGate, DensityMatrixImpl, GeneralQuantumOperatorImpl, GradCalculatorImpl, HermitianQuantumOperatorImpl, NoiseSimulatorImpl, ParametricQuantumCircuitImpl, PauliOperatorImpl, QuantumCircuitImpl, QuantumCircuitOptimizerImpl, QuantumCircuitSimulatorImpl, QuantumGateBase, QuantumGateDiagonalMatrix, QuantumGateMatrix, QuantumGateSparseMatrix, QuantumGate_CPTP, QuantumGate_Instrument, QuantumGate_Probabilistic, QuantumGate_SingleParameter, QuantumStateBase, QuantumStateImpl } from "./type/QulacsClass";

// Object.keys(module.exports) で一括取得して代入するため、1ファイルにexport変数をまとめている

export type QuantumState = QuantumStateImpl;
export type QuantumCircuit = QuantumCircuitImpl;
export type ParametricQuantumCircuit = ParametricQuantumCircuitImpl;
export type DensityMatrix = DensityMatrixImpl;
export type GeneralQuantumOperator = GeneralQuantumOperatorImpl;
export type HermitianQuantumOperator = HermitianQuantumOperatorImpl;
export type Observable = HermitianQuantumOperatorImpl;
export type PauliOperator = PauliOperatorImpl;
export type QuantumCircuitOptimizer = QuantumCircuitOptimizerImpl;
export type GradCalculator = GradCalculatorImpl;
export type QuantumCircuitSimulator = QuantumCircuitSimulatorImpl;
export type NoiseSimulator = NoiseSimulatorImpl;
export type CausalConeSimulator = CausalConeSimulatorImpl;

export var getExceptionMessage: (exceptionPtr: number) => string;
export var addFunction: (func: any, flag: string) => number;
export var removeFunction: (funcPtr: number) => void;

export var QuantumState: QuantumState;
export var QuantumCircuit: QuantumCircuit;
export var ParametricQuantumCircuit: ParametricQuantumCircuit;
export var DensityMatrix: DensityMatrix;
export var GeneralQuantumOperator: GeneralQuantumOperator;
export var HermitianQuantumOperator: HermitianQuantumOperator;
export var Observable: Observable;
export var PauliOperator: PauliOperator;
export var QuantumCircuitOptimizer: QuantumCircuitOptimizer;
export var GradCalculator: GradCalculator;
export var QuantumCircuitSimulator: QuantumCircuitSimulator;
export var NoiseSimulator: NoiseSimulator;
export var CausalConeSimulator: CausalConeSimulator;

export var Identity: (target_qubit_index: number) => ClsOneQubitGate;
export var X: (target_qubit_index: number) => ClsOneQubitGate;
export var Y: (target_qubit_index: number) => ClsOneQubitGate;
export var Z: (target_qubit_index: number) => ClsOneQubitGate;
export var H: (target_qubit_index: number) => ClsOneQubitGate;
export var S: (target_qubit_index: number) => ClsOneQubitGate;
export var Sdag: (target_qubit_index: number) => ClsOneQubitGate;
export var T: (target_qubit_index: number) => ClsOneQubitGate;
export var Tdag: (target_qubit_index: number) => ClsOneQubitGate;
export var sqrtX: (target_qubit_index: number) => ClsOneQubitGate;
export var sqrtXdag: (target_qubit_index: number) => ClsOneQubitGate;
export var sqrtY: (target_qubit_index: number) => ClsOneQubitGate;
export var sqrtYdag: (target_qubit_index: number) => ClsOneQubitGate;
export var P0: (target_qubit_index: number) => ClsOneQubitGate;
export var P1: (target_qubit_index: number) => ClsOneQubitGate;
export var U1: (target_qubit_index: number, lambda: number) => QuantumGateMatrix;
export var U2: (target_qubit_index: number, phi: number, lambda: number) => QuantumGateMatrix;
export var U3: (target_qubit_index: number, theta: number, phi: number, lambda: number) => QuantumGateMatrix;
export var RX: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RY: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RZ: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotInvX: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotInvY: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotInvZ: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotX: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotY: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var RotZ: (target_qubit_index: number, angle: number) => ClsOneQubitRotationGate;
export var CNOT: (control_qubit_index: number, target_qubit_index: number) => ClsOneControlOneTargetGate;
export var CZ: (control_qubit_index: number, target_qubit_index: number) => ClsOneControlOneTargetGate;
export var SWAP: (qubit_index1: number, qubit_index2: number) => ClsOneControlOneTargetGate;
export var TOFFOLI: (control_index1: number, control_index2: number, target_index: number) => QuantumGateMatrix;
export var FREDKIN: (control_index: number, target_index1: number, target_index2: number) => QuantumGateMatrix;
export var Pauli: (target_qubit_index_list: number[], pauli_ids: number[]) => QuantumGateMatrix;
export var PauliRotation: (target_qubit_index_list: number[], pauli_ids: number[], angle: number) => QuantumGateMatrix;
export var DenseMatrix: (target_qubit_index_list: number | number[], matrix: (Complex | number)[][]) => QuantumGateMatrix;
export var SparseMatrix: (target_qubit_index_list: number[], matrix: (Complex | number)[][]) => QuantumGateSparseMatrix;
export var DiagonalMatrix: (target_qubit_index_list: number[], diagonal_element: (Complex | number)[]) => QuantumGateDiagonalMatrix;
export var RandomUnitary: (target_qubit_index_list: number[], seed?: number) => QuantumGateMatrix;
export var ReversibleBoolean: (target_qubit_index_list: number[], function_ptr: (val: number, dim: number) => number) => ClsReversibleBooleanGate;
export var StateReflection: (reflection_state: QuantumStateBase) => ClsStateReflectionGate;
export var BitFlipNoise: (target_index: number, prob: number) => QuantumGate_Probabilistic;
export var DephasingNoise: (target_index: number, prob: number) => QuantumGate_Probabilistic;
export var IndependentXZNoise: (target_index: number, prob: number) => QuantumGate_Probabilistic;
export var DepolarizingNoise: (target_index: number, prob: number) => QuantumGate_Probabilistic;
export var TwoQubitDepolarizingNoise: (target_index1: number, target_index2: number, prob: number) => QuantumGate_Probabilistic;
export var AmplitudeDampingNoise: (target_index: number, prob: number) => QuantumGate_CPTP;
export var Measurement: (target_index: number, classical_register_address: number) => QuantumGate_Instrument;
export var NoisyEvolution_fast: (hamiltonian: Observable, c_ops: GeneralQuantumOperator[], time: number) => ClsNoisyEvolution_fast;

export var partial_trace: (state: QuantumState | DensityMatrix, target_traceout: number[]) => DensityMatrix;
export var to_matrix_gate: (gate: QuantumGateBase) => QuantumGateMatrix;
export var inner_product: (state_bra: QuantumState, state_ket: QuantumState) => Complex;
export var tensor_product: <T = QuantumState | DensityMatrix>(state_left: T, state_right: T) => QuantumState;
export var drop_qubit: (state: QuantumState, target: number[], order: number[]) => QuantumState;
export var make_superposition: (coef1: number | Complex, state1: QuantumState, coef2: number | Complex, state2: QuantumState) => QuantumState;
export var make_mixture: (prob1: number | Complex, state1: QuantumStateBase, prob2: number | Complex, state2: QuantumStateBase) => DensityMatrix;
export var permutate_qubit: <T = QuantumState | DensityMatrix>(state: T, qubit_order: number[]) => T;

export var merge: (gate_applied_firstOrGateList: QuantumGateBase | QuantumGateBase[], gate_applied_later?: QuantumGateBase) => QuantumGateMatrix;
export var add: (gate1OrGateList: QuantumGateBase | QuantumGateBase[], gate2?: QuantumGateBase) => QuantumGateMatrix;
export var Probabilistic: (distribution: number[], gate_list: QuantumGateBase[]) => QuantumGateBase;
export var CPTP: (gate_list: QuantumGateBase[]) => QuantumGateBase;
export var CP: (gate_list: QuantumGateBase[], state_normalize: boolean, probability_normalize: boolean, assign_zero_if_not_matched: boolean) => QuantumGateBase;
export var Instrument: (gate_list: QuantumGateBase[], classical_register_address: number) => QuantumGateBase;
export var Adaptive: (gate: QuantumGateBase, function_ptr: (list: number[]) => boolean) => QuantumGateBase;
export var ParametricRX: (target_qubit_index: number, initial_angle: number) => QuantumGate_SingleParameter;
export var ParametricRY: (target_qubit_index: number, initial_angle: number) => QuantumGate_SingleParameter;
export var ParametricRZ: (target_qubit_index: number, initial_angle: number) => QuantumGate_SingleParameter;
// export var ParametricPauliRotation: (target_qubit_index: number, initial_angle: number) => QuantumGate_SingleParameter;

export var from_json: <T= GeneralQuantumOperator | HermitianQuantumOperator | QuantumState | DensityMatrix | QuantumStateBase | QuantumGateBase | QuantumCircuit>(json: string) => T;
export var create_quantum_operator_from_openfermion_text: (text: string) => GeneralQuantumOperator;

export function applyModule(qulacsModule: QulacsWasmModule) {
    Object.keys(module.exports).forEach(key => {
        const wasmExportedImpl = (qulacsModule as any)[key];
        if (wasmExportedImpl) module.exports[key] = wasmExportedImpl;
    });
    applayAlias();
    applyQuantumStateOverload(qulacsModule);
    applyDensityMatrixOverload();
    applyQuantumCircuitSimulatorOverload();
    applyFunctionOverload(qulacsModule);
}

function applayAlias() {
    Observable = HermitianQuantumOperator;
}

function applyQuantumStateOverload(qulacsModule: any) {
    QuantumState.prototype.load = function(arg: any) {
        if (Array.isArray(arg)) return QuantumState.prototype.load_Vector.call(this, arg);
        return QuantumState.prototype.load_QuantumStateBase.call(this, arg);
    }

    QuantumState.prototype.multiply_elementwise_function = function(func: (val: number) => Complex) {
        // NOTE: EM_JSで使うdyncallは入出力にvijfd型のみ利用できるため、funcが返すComplexをdyncall元に返すことができない
        // そのため、funcの返り値をcomplexRegeneratorでdoubleに分解し、dyncallが渡すポインタに先に書き込み、
        // complexRegenerator自体はvoidを返す
        // dyncall側にはポインタから返り値を読みだすことを期待する
        const complexRegenerator = (intNum: number, complexArrPointer: number): void => {
             // eslint-disable-next-line no-undef
            const setValueFunc = qulacsModule["setValue"] as typeof setValue;
            const c: Complex = func(intNum);
            setValueFunc(complexArrPointer, c.real, "double");
            setValueFunc(complexArrPointer + 8, c.imag, "double");
        }
        const fnPointer = addFunction(complexRegenerator, "vii");
        return QuantumState.prototype.multiply_elementwise_function_wrapper.call(this, fnPointer);
    }
}

function applyDensityMatrixOverload() {
    DensityMatrix.prototype.load = function(arg: any) {
        if (Array.isArray(arg)) {
            if (Array.isArray(arg[0])) {
                return DensityMatrix.prototype.load_Matrix.call(this, arg);
            } else {
                return DensityMatrix.prototype.load_Vector.call(this, arg);
            }
        }
        return DensityMatrix.prototype.load_QuantumStateBase.call(this, arg);
    }
}

function applyQuantumCircuitSimulatorOverload() {
    QuantumCircuitSimulator.prototype.initialize_state = function(computationl_basis: number) {
        return QuantumCircuitSimulator.prototype.initialize_state_itype_wrapper.call(this, computationl_basis);
    }
}

function applyFunctionOverload(qulacsModule: any) {
    partial_trace = (state: any, target_traceout: number[]) => {
        // NOTE: 暫定。より確実な判定方法を検討する
        const names = getPtrNames(state);
        if (names?.ptrTypeName === "QuantumState*") {
            return qulacsModule["partial_trace_QuantumState"](state, target_traceout);
        } else {
            return qulacsModule["partial_trace_DensityMatrix"](state, target_traceout);
        }
    }

    tensor_product = (state_left: any, state_right: any) => {
        // NOTE: 暫定。より確実な判定方法を検討する
        const names_left = getPtrNames(state_left);
        const names_right = getPtrNames(state_right);
        if (names_left?.ptrTypeName === "QuantumState*" && names_right?.ptrTypeName === "QuantumState*") {
            return qulacsModule["tensor_product_QuantumState"](state_left, state_right);
        } else {
            return qulacsModule["tensor_product_DensityMatrix"](state_left, state_right);
        }

    };

    permutate_qubit = (state: any, qubit_order: number[]) => {
        // NOTE: 暫定。より確実な判定方法を検討する
        const names = getPtrNames(state);
        if (names?.ptrTypeName === "QuantumState*") {
            return qulacsModule["permutate_qubit_QuantumState"](state, qubit_order);
        } else {
            return qulacsModule["permutate_qubit_DensityMatrix"](state, qubit_order);
        }   
    }

    ReversibleBoolean = (target_qubit_index_list: number[], function_ptr: (val: number, dim: number) => number) => {
        const fnPointer = addFunction(function_ptr, "iii");
        const gate = qulacsModule["ReversibleBoolean"](target_qubit_index_list, fnPointer);
        //removeFunction(fnPointer); // NOTE: return後もC++側クロージャが参照する可能性が残るので、いつ消せるか検討。ReversibleBooleanのdeleteまで？
        return gate;
    }

    DenseMatrix = (target_qubit_index_list: number | number[], matrix: (Complex | number)[][]) => {
        if (Array.isArray(target_qubit_index_list)) {
            return qulacsModule["DenseMatrix_vector_UINT"](target_qubit_index_list, matrix);
        } else {
            return qulacsModule["DenseMatrix_UINT"](target_qubit_index_list, matrix);
        }
    }

    merge = (gate1OrGateList: QuantumGateBase | QuantumGateBase[], gate2?: QuantumGateBase) => {
        if (Array.isArray(gate1OrGateList)) {
            const pointerList: number[] = gate1OrGateList.map(gate => qulacsModule["_getAbstractQuantumGateBasePointer"](gate));
            return qulacsModule["merge_QuantumGateBase_pointer"](pointerList);
        } else {
            return qulacsModule["merge"](gate1OrGateList, gate2);
        }
    }

    add = (gate1OrGateList: QuantumGateBase | QuantumGateBase[], gate2?: QuantumGateBase) => {
        if (Array.isArray(gate1OrGateList)) {
            const pointerList: number[] = gate1OrGateList.map(gate => qulacsModule["_getAbstractQuantumGateBasePointer"](gate));
            return qulacsModule["add_QuantumGateBase_pointer"](pointerList);
        } else {
            return qulacsModule["add"](gate1OrGateList, gate2);
        }
    }

    Probabilistic = (distribution: number[], gate_list: QuantumGateBase[]) => {
        const pointerList: number[] = gate_list.map(gate => qulacsModule["_getAbstractQuantumGateBasePointer"](gate));
        return qulacsModule["Probabilistic_QuantumGateBase_pointer"](distribution, pointerList);
    }

    NoisyEvolution_fast = (hamiltonian: Observable, c_ops: GeneralQuantumOperator[], time: number) => {
        const pointerList: number[] = c_ops.map(op => qulacsModule["_getAbstractGeneralQuantumOperatorPointer"](op));
        return qulacsModule["NoisyEvolution_fast_pointer"](hamiltonian, pointerList, time);
    }

    CPTP = (gate_list: QuantumGateBase[]) => {
        const pointerList: number[] = gate_list.map(gate => qulacsModule["_getAbstractQuantumGateBasePointer"](gate));
        return qulacsModule["CPTP_QuantumGate_pointer"](pointerList);
    }

    CP = (gate_list: QuantumGateBase[], state_normalize: boolean, probability_normalize: boolean, assign_zero_if_not_matched: boolean) => {
        const pointerList: number[] = gate_list.map(gate => qulacsModule["_getAbstractQuantumGateBasePointer"](gate));
        return qulacsModule["CPTP_QuantumGate_pointer"](pointerList, state_normalize, probability_normalize, assign_zero_if_not_matched);
    }

    Instrument = (gate_list: QuantumGateBase[], classical_register_address: number) => {
        const pointerList: number[] = gate_list.map(gate => qulacsModule["_getAbstractQuantumGateBasePointer"](gate));
        return qulacsModule["Instrument_QuantumGate_pointer"](pointerList, classical_register_address);
    }

    Adaptive = (gate: QuantumGateBase, func: (list: number[]) => boolean) => {
        // NOTE: dyncallは入出力にvijfd型のみ利用できるため、dyncall元からfuncにvector/arrayを渡すことができない
        // そのため、listRegeneratorでポインタから配列要素を復元してからfuncに渡す
        // funcの返り値はboolをそのまま返す
        // dyncall側にはJSで扱いたい配列のポインタを渡すことを期待する
        const listRegenerator = (listPointer: number, size: number): boolean => {
            const list: number[] = [];
            var nByte = 4;
              // eslint-disable-next-line no-undef
              const getValueFunc = qulacsModule["getValue"] as typeof getValue;
            for (let i = 0; i < size; i++) {
                const n = getValueFunc(listPointer + i * nByte, "i32"); // NOTE: intのバイト数は環境依存の改善が必要かもしれない。sizeofする？
                list.push(n);
            }
            return func(list);
        };
        const fnPointer = addFunction(listRegenerator, "iii");
        return qulacsModule["Adaptive"](gate, fnPointer);
    }

    from_json = <T= GeneralQuantumOperator | HermitianQuantumOperator | QuantumState | DensityMatrix | QuantumStateBase | QuantumGateBase | QuantumCircuit>(json: string): T => {
        const data = JSON.parse(json);
        switch (data.name) {
            case "GeneralQuantumOperator":
                return qulacsModule["from_json_GeneralQuantumOperator"](json);
            case "HermitianQuantumOperator":
                return qulacsModule["from_json_HermitianQuantumOperator"](json);
            case "QuantumState":
                return qulacsModule["from_json_QuantumState"](json);
            case "DensityMatrix":
                return qulacsModule["from_json_DensityMatrix"](json);
            case "QuantumStateBase":
                return qulacsModule["from_json_QuantumStateBase"](json);
            case "QuantumGateBase":
                return qulacsModule["from_json_QuantumGateBase"](json);
            case "QuantumCircuit":
                return qulacsModule["from_json_QuantumCircuit"](json);
            default :
                // TODO: DenseMatrixGateやXGate、CNOTGate、ParametricQuantumCircuitなどの暗黙の命名規則に依存している。型名をすべて列挙するなどの修正が必要
                if (data.name.includes("Gate")) return qulacsModule["from_json_QuantumGateBase"](json);
                if (data.name.includes("QuantumCircuit")) return qulacsModule["from_json_QuantumCircuit"](json);
                throw new Error(`unknown json data, type name: ${data.name} is cannot use from_json.`)
        }
    }
}

function getPtrNames(instance: any) {
    if (!instance || !instance.$$.ptrType) return null;
    const ptrTypeName: string = instance.$$.ptrType.name;
    const registeredClassNames: string[] = [instance.$$.ptrType.registeredClass.name];

    let targetClass = instance.$$.ptrType.registeredClass;
    while (targetClass.baseClass) {
        registeredClassNames.push(targetClass.baseClass.name);
        targetClass = targetClass.baseClass;
    }
    return {
        ptrTypeName,
        registeredClassNames
    }
}
