import { useState } from 'react';
import { executeQuery } from './executor';
import { useQueryStore } from './store';
import { getSchemaById } from './schema';
import { addToHistory } from './history';
import { MOCK_USERS, MOCK_PRODUCTS, MOCK_ORDERS } from './mock-data';

const MOCK_DATASETS: Record<string, any[]> = {
  users: MOCK_USERS,
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
};

export function useQueryExecution() {
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  
  const store = useQueryStore();

  const execute = () => {
    setIsLoading(true);
    
    // Slight delay to show loading state (simulate network)
    setTimeout(() => {
      const activeSchema = getSchemaById(store.activeSchemaId);
      const activeDataset = MOCK_DATASETS[store.activeSchemaId] || [];
      
      const { results: queryResults, executionTimeMs } = executeQuery(
        { groups: store.groups, rules: store.rules, rootGroupId: store.rootGroupId },
        activeSchema, 
        activeDataset
      );
      
      setExecutionTime(executionTimeMs);
      setResults(queryResults as Record<string, unknown>[]);
      setHasExecuted(true);
      setIsLoading(false);
      
      // Save history
      addToHistory(
        { groups: store.groups, rules: store.rules, rootGroupId: store.rootGroupId },
        `Executed ${store.activeSchemaId} query (${queryResults.length} results)`
      );
    }, 400);
  };

  const clearResults = () => {
    setResults([]);
    setExecutionTime(0);
    setHasExecuted(false);
  };

  return {
    results,
    executionTime,
    isLoading,
    hasExecuted,
    execute,
    clearResults,
  };
}
