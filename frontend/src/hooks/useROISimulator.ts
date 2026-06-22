import { useReducer, useCallback } from 'react';

interface SimulatorState {
  estimatedHours: number;
  hourlyRate: number;
  modulesUsed: number;
  modulesSavingsRate: number;
  complexityModifier: number;
  baseRevenue: number;
  moduleSavings: number;
  effectiveHours: number;
  projectedMargin: number;
  roi: number;
  efficiencyScore: number;
  isCalculating: boolean;
  lastCalculated: string | null;
}

const initialState: SimulatorState = {
  estimatedHours: 20,
  hourlyRate: 75,
  modulesUsed: 0,
  modulesSavingsRate: 0.20,
  complexityModifier: 1.0,
  baseRevenue: 0,
  moduleSavings: 0,
  effectiveHours: 0,
  projectedMargin: 0,
  roi: 0,
  efficiencyScore: 0,
  isCalculating: false,
  lastCalculated: null,
};

type Action =
  | { type: 'SET_HOURS'; payload: number }
  | { type: 'SET_RATE'; payload: number }
  | { type: 'SET_MODULES'; payload: number }
  | { type: 'SET_COMPLEXITY'; payload: number }
  | { type: 'SET_SAVINGS_RATE'; payload: number }
  | { type: 'CALCULATE' }
  | { type: 'RESET' };

function calculateROI(state: SimulatorState) {
  const {
    estimatedHours,
    hourlyRate,
    modulesUsed,
    modulesSavingsRate,
    complexityModifier,
  } = state;

  const baseRevenue = estimatedHours * hourlyRate * complexityModifier;
  const totalSavingsRate = Math.min(modulesUsed * modulesSavingsRate, 0.8);
  const moduleSavings = baseRevenue * totalSavingsRate;
  const effectiveHours = estimatedHours * (1 - totalSavingsRate);
  const effectiveCost = effectiveHours * hourlyRate;
  const projectedMargin = baseRevenue - effectiveCost;
  const roi = effectiveCost > 0 ? ((projectedMargin / effectiveCost) * 100) : 0;
  
  const efficiencyScore = Math.min(100, 
    (modulesUsed * 20) + 
    (100 - complexityModifier * 50) + 
    (totalSavingsRate * 30)
  );

  return {
    baseRevenue: Math.round(baseRevenue * 100) / 100,
    moduleSavings: Math.round(moduleSavings * 100) / 100,
    effectiveHours: Math.round(effectiveHours * 10) / 10,
    projectedMargin: Math.round(projectedMargin * 100) / 100,
    roi: Math.round(roi * 10) / 10,
    efficiencyScore: Math.round(Math.max(0, Math.min(100, efficiencyScore))),
    lastCalculated: new Date().toISOString(),
  };
}

function reducer(state: SimulatorState, action: Action): SimulatorState {
  switch (action.type) {
    case 'SET_HOURS': return { ...state, estimatedHours: action.payload };
    case 'SET_RATE': return { ...state, hourlyRate: action.payload };
    case 'SET_MODULES': return { ...state, modulesUsed: action.payload };
    case 'SET_COMPLEXITY': return { ...state, complexityModifier: action.payload };
    case 'SET_SAVINGS_RATE': return { ...state, modulesSavingsRate: action.payload };
    case 'CALCULATE': return { ...state, ...calculateROI(state), isCalculating: false };
    case 'RESET': return { ...initialState };
    default: return state;
  }
}

export function useROISimulator(initialValues: Partial<SimulatorState> = {}) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ...initialValues,
  });

  const setHours = useCallback((hours: number) => dispatch({ type: 'SET_HOURS', payload: hours }), []);
  const setRate = useCallback((rate: number) => dispatch({ type: 'SET_RATE', payload: rate }), []);
  const setModules = useCallback((modules: number) => dispatch({ type: 'SET_MODULES', payload: modules }), []);
  const setComplexity = useCallback((complexity: number) => dispatch({ type: 'SET_COMPLEXITY', payload: complexity }), []);
  const calculate = useCallback(() => dispatch({ type: 'CALCULATE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    ...state,
    setHours,
    setRate,
    setModules,
    setComplexity,
    calculate,
    reset,
    isScalable: state.modulesUsed >= 2,
    isProfitable: state.projectedMargin > 0,
  };
}
