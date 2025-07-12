import { useEffect, useState, useRef } from 'react';
import {jsondata} from './assets/data'
import { ChevronDown } from 'lucide-react';
import '../src/App.css';
import type { DataRow,Filters } from './assets/store';
import { useDataStore } from './assets/store';

export function filterData(data: DataRow[], filters: Filters) {
  return data.filter((row) => {
    return Object.entries(filters).every(([key, values]) => {
      return values.length === 0 || values.includes(row[key as keyof DataRow] as number);
    });
  });
}

function getOptionsForFilterX(data: DataRow[], filters: Filters, currentKey: string): number[] {
  const otherFilters = { ...filters };
  delete otherFilters[currentKey];
  const filteredData = filterData(data, otherFilters);
  const values = filteredData.map((row) => row[currentKey as keyof DataRow] as number);
  return [...new Set(values)].sort((a, b) => a - b);
}

const ROW_HEIGHT = 40;
const VISIBLE_ROW_COUNT = 20;
const OVERSCAN_COUNT = 5;

const FilterDashboard = () => {
  const { originalData, filteredData, filters, setOriginalData, setFilter } = useDataStore();

  useEffect(() => {
    setOriginalData(jsondata); // Load the full dataset
  }, [setOriginalData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]') && !target.closest('button')) {
        document.querySelectorAll('[data-dropdown]').forEach((dropdown) => {
          dropdown.classList.add('hidden');
        });
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filterKeys = Object.keys(filters);

  // Pagination 
  const ROWS_PER_PAGE = 100;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ROWS_PER_PAGE));
  const pageStart = (currentPage - 1) * ROWS_PER_PAGE;
  const pageEnd = Math.min(filteredData.length, pageStart + ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(pageStart, pageEnd);

  // Windowed pagination 
  const PAGE_WINDOW_SIZE = 16;
  const [pageWindowStart, setPageWindowStart] = useState(0);

  useEffect(() => {
    if (currentPage < pageWindowStart + 1) {
      setPageWindowStart(Math.max(0, currentPage - 1));
    } else if (currentPage > pageWindowStart + PAGE_WINDOW_SIZE) {
      setPageWindowStart(Math.min(totalPages - PAGE_WINDOW_SIZE, currentPage - PAGE_WINDOW_SIZE));
    }
  }, [currentPage, pageWindowStart, totalPages]);

  const handleNextWindow = () => {
    const newStart = Math.min(pageWindowStart + PAGE_WINDOW_SIZE, Math.max(0, totalPages - PAGE_WINDOW_SIZE));
    setPageWindowStart(newStart);
    setCurrentPage(newStart + 1); // Set to first page in new window
  };
  const handlePrevWindow = () => {
    const newStart = Math.max(pageWindowStart - PAGE_WINDOW_SIZE, 0);
    setPageWindowStart(newStart);
    setCurrentPage(Math.min(newStart + PAGE_WINDOW_SIZE, totalPages)); // Set to last page in new window
  };

  // --- Virtualization logic ---
  const [scrollTop, setScrollTop] = useState(0);
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const totalRows = paginatedData.length;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_COUNT);
  const endIdx = Math.min(totalRows, startIdx + VISIBLE_ROW_COUNT + 2 * OVERSCAN_COUNT);
  const visibleRows = paginatedData.slice(startIdx, endIdx);

  return (
    <div className="px-6 w-full bg-gray-100 pt-3 pb-5">
      <div className="flex flex-col md:flex-row md:items-center gap-10">
      <h1 className="text-xl font-bold mb-4 text-slate-700">Apply Filters:</h1>

<div className="flex gap-5 flex-wrap w-full mb-4">
  {filterKeys.map((key) => {
    const options = getOptionsForFilterX(originalData, filters, key);
    const selected = filters[key];
    return (
      <div key={key} className="relative w-48">
        <label className="block font-semibold text-slate-800 mb-1">{key}</label>
        <button
          onClick={() => {
            const currentOpen = document.querySelector(`[data-dropdown="${key}"]`)?.classList.contains('hidden');
            document.querySelectorAll('[data-dropdown]').forEach((dropdown) => {
              dropdown.classList.add('hidden');
            });
            const dropdown = document.querySelector(`[data-dropdown="${key}"]`);
            if (dropdown) {
              dropdown.classList.toggle('hidden', !currentOpen);
            }
          }}
          className="w-full border px-2 py-1 rounded bg-white text-left flex justify-between items-center"
        >
          <span>{selected.length > 0 ? `${selected.length} selected` : `Select ${key}`}</span>
          <ChevronDown className="text-black h-5 w-5" />
        </button>
        <div
          data-dropdown={key}
          className="absolute top-full left-0 right-0 bg-white border rounded mt-1 shadow-lg z-10 hidden max-h-40 overflow-y-auto"
        >
          {options.map((opt) => (
            <label key={opt} className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilter(key, [...selected, opt]);
                  } else {
                    setFilter(key, selected.filter((val) => val !== opt));
                  }
                }}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  })}
</div>
      </div>
      <h2 className='font-semibold text-slate-700 text-md pb-3 text-center underline underline-offset-4'>Virtualized List With Pagination — Large dataset</h2>
      <div className="border rounded bg-white overflow-y-hidden" style={{ height: ROW_HEIGHT * VISIBLE_ROW_COUNT - 40 }}>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-gray-300 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-start">Number</th>
              <th className="px-4 py-2 text-start">mod350</th>
              <th className="px-4 py-2 text-start">mod8000</th>
              <th className="px-4 py-2 text-start">mod20002</th>
            </tr>
          </thead>
        </table>
        {/* Virtualized body */}
        <div
          style={{
            height: ROW_HEIGHT * VISIBLE_ROW_COUNT,
            overflowY: 'auto',
            position: 'relative',
          }}
          onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
          ref={tableBodyRef}
        >
          <div style={{ height: paginatedData.length * ROW_HEIGHT, position: 'relative' }}>
            <div style={{ transform: `translateY(${startIdx * ROW_HEIGHT}px)` }}>
              <table className="min-w-full text-sm">
                <tbody>
                  {visibleRows.map((row, idx) => (
                    <tr key={startIdx + idx} className="even:bg-gray-50 text-slate-700">
                      <td className="px-4 py-2">{row.number}</td>
                      <td className="px-4 py-2">{row.mod350}</td>
                      <td className="px-4 py-2">{row.mod8000}</td>
                      <td className="px-4 py-2">{row.mod20002}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Pagination comp */}
      <div className="flex justify-center items-center gap-2 mt-4 max-w-[98vw] overflow-x-scroll">
        <button
          className="px-3 py-1 flex hover:cursor-pointer items-center gap-1 rounded border bg-slate-800 text-gray-100 disabled:opacity-50"
          onClick={handlePrevWindow}
          disabled={pageWindowStart === 0}
        >
          {'<< Prev'}
        </button>
        {Array.from({ length: Math.min(PAGE_WINDOW_SIZE, totalPages - pageWindowStart) }).map((_, idx) => {
          const pageNum = pageWindowStart + idx + 1;
          return (
            <button
              key={pageNum}
              className={`px-3 mx-1 py-1 flex items-center hover:cursor-pointer gap-1 rounded border ${currentPage === pageNum ? 'bg-slate-700 text-white' : 'bg-gray-100'}`}
              onClick={() => setCurrentPage(pageNum)}
            >
              <span>{pageNum}</span>
            </button>
          );
        })}
        <button
          className="px-3 py-1 flex items-center gap-1 rounded hover:cursor-pointer border bg-slate-800 text-gray-100 disabled:opacity-50"
          onClick={handleNextWindow}
          disabled={pageWindowStart + PAGE_WINDOW_SIZE >= totalPages}
        >
          {'Next >>'}
        </button>
      </div>
    </div>
  );
};

export default FilterDashboard;
