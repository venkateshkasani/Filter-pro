import { create } from "zustand";
import { filterData } from "../App";

export type DataRow = {
    number: number;
    mod350: number;
    mod8000: number;
    mod20002: number;
  };
  
 export type Filters = Record<string, number[]>;
  
  
export  const useDataStore = create<{
    originalData: DataRow[];
    filteredData: DataRow[];
    filters: Filters;
    setOriginalData: (data: DataRow[]) => void;
    setFilter: (key: string, values: number[]) => void;
  }>((set, get) => ({
    originalData: [],
    filteredData: [],
    filters: {
      mod350: [],
      mod8000: [],
      mod20002: [],
    },
    setOriginalData: (data) =>
      set(() => ({
        originalData: data,
        filteredData: data,
      })),
    setFilter: (key, values) => {
      console.time('filter');
      const filters = { ...get().filters, [key]: values };
      const filteredData = filterData(get().originalData, filters);
      set({ filters, filteredData });
      console.timeEnd('filter');
    },
  }));