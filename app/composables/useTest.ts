import type { Test } from "~~/shared/types/test";
import type { Filter_Test } from "~~/shared/types/filter_test";

type TestsResponse = {
  tests: Test[];
  total: number;
};


export const useTest = (filters: Filter_Test) => {
  return useFetch<TestsResponse>('/api/tests', {
    params: filters,
    watch: [filters],
    default: () => ({ tests: [], total: 0 })
  });
}