import { useReducer, useCallback } from 'react';

interface SaaSState {
  monthlyPrice: number;
  initialCustomers: number;
  newCustomersPerMonth: number;
  churnRate: number; // in percentage (e.g. 5 for 5%)
  horizonMonths: 12 | 24;
  
  // Calculated results
  projections: {
    month: number;
    baseMRR: number;
    optimisticMRR: number;
    pessimisticMRR: number;
    baseCustomers: number;
  }[];
  finalMRR: number;
  finalARR: number;
  finalCustomers: number;
  cumulativeRevenue: number;
  
  isCalculating: boolean;
}

const initialState: SaaSState = {
  monthlyPrice: 29,
  initialCustomers: 5,
  newCustomersPerMonth: 10,
  churnRate: 5,
  horizonMonths: 12,
  projections: [],
  finalMRR: 0,
  finalARR: 0,
  finalCustomers: 0,
  cumulativeRevenue: 0,
  isCalculating: false,
};

type Action =
  | { type: 'SET_PRICE'; payload: number }
  | { type: 'SET_INITIAL_CUSTOMERS'; payload: number }
  | { type: 'SET_NEW_CUSTOMERS'; payload: number }
  | { type: 'SET_CHURN'; payload: number }
  | { type: 'SET_HORIZON'; payload: 12 | 24 }
  | { type: 'CALCULATE' }
  | { type: 'RESET' };

function calculateSaaS(state: SaaSState): Partial<SaaSState> {
  const { monthlyPrice, initialCustomers, newCustomersPerMonth, churnRate, horizonMonths } = state;
  const churnDecimal = churnRate / 100;
  
  const projections = [];
  let currentBaseCustomers = initialCustomers;
  let currentOptimisticCustomers = initialCustomers;
  let currentPessimisticCustomers = initialCustomers;
  let totalRevenue = 0;

  // Month 0 (Initial state)
  projections.push({
    month: 0,
    baseMRR: initialCustomers * monthlyPrice,
    optimisticMRR: initialCustomers * monthlyPrice,
    pessimisticMRR: initialCustomers * monthlyPrice,
    baseCustomers: initialCustomers,
  });

  for (let m = 1; m <= horizonMonths; m++) {
    // Base Scenario
    currentBaseCustomers = currentBaseCustomers * (1 - churnDecimal) + newCustomersPerMonth;
    const baseMRR = currentBaseCustomers * monthlyPrice;
    
    // Optimistic Scenario (+30% growth, -20% churn)
    const optNew = newCustomersPerMonth * 1.3;
    const optChurn = churnDecimal * 0.8;
    currentOptimisticCustomers = currentOptimisticCustomers * (1 - optChurn) + optNew;
    const optimisticMRR = currentOptimisticCustomers * monthlyPrice;
    
    // Pessimistic Scenario (-30% growth, +20% churn)
    const pesNew = newCustomersPerMonth * 0.7;
    const pesChurn = churnDecimal * 1.2;
    currentPessimisticCustomers = currentPessimisticCustomers * (1 - pesChurn) + pesNew;
    const pessimisticMRR = currentPessimisticCustomers * monthlyPrice;
    
    projections.push({
      month: m,
      baseMRR: Math.round(baseMRR),
      optimisticMRR: Math.round(optimisticMRR),
      pessimisticMRR: Math.round(pessimisticMRR),
      baseCustomers: Math.round(currentBaseCustomers),
    });
    
    totalRevenue += baseMRR;
  }

  const finalMRR = projections[projections.length - 1].baseMRR;
  
  return {
    projections,
    finalMRR,
    finalARR: finalMRR * 12,
    finalCustomers: projections[projections.length - 1].baseCustomers,
    cumulativeRevenue: Math.round(totalRevenue),
  };
}

function reducer(state: SaaSState, action: Action): SaaSState {
  switch (action.type) {
    case 'SET_PRICE': return { ...state, monthlyPrice: action.payload };
    case 'SET_INITIAL_CUSTOMERS': return { ...state, initialCustomers: action.payload };
    case 'SET_NEW_CUSTOMERS': return { ...state, newCustomersPerMonth: action.payload };
    case 'SET_CHURN': return { ...state, churnRate: action.payload };
    case 'SET_HORIZON': return { ...state, horizonMonths: action.payload };
    case 'CALCULATE': return { ...state, ...calculateSaaS(state) };
    case 'RESET': return { ...initialState };
    default: return state;
  }
}

export function useSaaSSimulator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setPrice = useCallback((val: number) => dispatch({ type: 'SET_PRICE', payload: val }), []);
  const setInitialCustomers = useCallback((val: number) => dispatch({ type: 'SET_INITIAL_CUSTOMERS', payload: val }), []);
  const setNewCustomers = useCallback((val: number) => dispatch({ type: 'SET_NEW_CUSTOMERS', payload: val }), []);
  const setChurn = useCallback((val: number) => dispatch({ type: 'SET_CHURN', payload: val }), []);
  const setHorizon = useCallback((val: 12 | 24) => dispatch({ type: 'SET_HORIZON', payload: val }), []);
  const calculate = useCallback(() => dispatch({ type: 'CALCULATE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    ...state,
    setPrice,
    setInitialCustomers,
    setNewCustomers,
    setChurn,
    setHorizon,
    calculate,
    reset,
  };
}
