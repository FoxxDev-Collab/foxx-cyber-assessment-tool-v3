"use client"

import { getFamilyFullName } from '../../lib/utils/controlUtils';
import { AssessmentResult } from './types';

// Generate CSV preview
export const generateCSVPreview = (data: AssessmentResult) => {
  if (!data?.assessment) return 'No data available';
  
  const headers = ['Family', 'Control ID', 'Title', 'Status', 'Notes', 'Score'];
  const rows: string[][] = [];
  
  // Process each family and control
  Object.entries(data.assessment.controls).forEach(([familyId, familyControls]) => {
    Object.entries(familyControls).forEach(([controlId, control]) => {
      rows.push([
        getFamilyFullName(familyId),
        controlId,
        `${controlId} Control`, // Placeholder for actual control title
        control.status,
        control.notes || '',
        control.score.toString()
      ]);
    });
  });
  
  // Sort by control ID
  rows.sort((a, b) => a[1].localeCompare(b[1]));
  
  // Create CSV preview (first 20 rows)
  const csvContent = [
    headers.join(','),
    ...rows.slice(0, 20).map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  return rows.length > 20 
    ? csvContent + '\n...\n(Preview shows 20 of ' + rows.length + ' rows)'
    : csvContent;
};

// Generate full CSV content
export const generateCSVContent = (data: AssessmentResult) => {
  if (!data?.assessment) return '';
  
  const headers = ['Family', 'Control ID', 'Title', 'Status', 'Notes', 'Score'];
  const rows: string[][] = [];
  
  // Process each family and control
  Object.entries(data.assessment.controls).forEach(([familyId, familyControls]) => {
    Object.entries(familyControls).forEach(([controlId, control]) => {
      rows.push([
        getFamilyFullName(familyId),
        controlId,
        `${controlId} Control`, // Placeholder for actual control title
        control.status,
        control.notes || '',
        control.score.toString()
      ]);
    });
  });
  
  // Sort by control ID
  rows.sort((a, b) => a[1].localeCompare(b[1]));
  
  // Create full CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  return csvContent;
}; 