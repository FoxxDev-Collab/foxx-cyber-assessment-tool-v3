import React from 'react';
import { getFamilyFullName, getControlFamilies, type Controls } from '../../lib/utils/controlUtils';

interface ControlFiltersProps {
  controls: Controls;
  selectedFamily: string;
  selectedBaseline: string;
  searchQuery: string;
  onFamilyChange: (family: string) => void;
  onBaselineChange: (baseline: string) => void;
  onSearchChange: (query: string) => void;
}

const ControlFilters: React.FC<ControlFiltersProps> = ({
  controls,
  selectedFamily,
  selectedBaseline,
  searchQuery,
  onFamilyChange,
  onBaselineChange,
  onSearchChange
}) => {
  const families = ['ALL', ...getControlFamilies(controls)];
  
  // Sort families alphabetically, keeping 'ALL' at the top
  families.sort((a, b) => {
    if (a === 'ALL') return -1;
    if (b === 'ALL') return 1;
    return a.localeCompare(b);
  });
  
  const baselineLevels = ['ALL', 'LOW', 'MODERATE', 'HIGH'];
  
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 pb-2 border-b">Control Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Control Family</label>
          <select 
            className="w-full p-3 border border-input rounded bg-white"
            value={selectedFamily}
            onChange={(e) => onFamilyChange(e.target.value)}
          >
            {families.map(family => (
              <option key={family} value={family}>
                {family === 'ALL' ? 'All Families' : `${family} - ${getFamilyFullName(family)}`}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Baseline</label>
          <select 
            className="w-full p-3 border border-input rounded bg-white"
            value={selectedBaseline}
            onChange={(e) => onBaselineChange(e.target.value)}
          >
            {baselineLevels.map(level => (
              <option key={level} value={level}>
                {level === 'ALL' ? 'All Baselines' : `${level} Baseline`}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Search Controls</label>
          <input 
            type="text"
            className="w-full p-3 border border-input rounded"
            placeholder="Search by ID, title, or description"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 p-3 bg-secondary/30 rounded">
        <p className="text-sm font-medium mr-2 w-full md:w-auto">Status Legend:</p>
        <div className="flex items-center space-x-1">
          <span className="inline-block w-4 h-4 rounded-full bg-green-500"></span>
          <span className="text-sm">Implemented</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="inline-block w-4 h-4 rounded-full bg-orange-400"></span>
          <span className="text-sm">Partially Implemented</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="inline-block w-4 h-4 rounded-full bg-blue-400"></span>
          <span className="text-sm">Planned</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="inline-block w-4 h-4 rounded-full bg-red-500"></span>
          <span className="text-sm">Not Implemented</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="inline-block w-4 h-4 rounded-full bg-gray-400"></span>
          <span className="text-sm">Not Applicable</span>
        </div>
      </div>
    </div>
  );
};

export default ControlFilters; 