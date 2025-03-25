"use client"

import React, { useState } from 'react';
import type { Control } from '../../lib/utils/controlUtils';
import { getFamilyFullName } from '../../lib/utils/controlUtils';

// Matching the v2.html export format
interface AssessmentControl {
  status: string;
  notes: string;
  score: number;
}

interface AssessmentControlFamily {
  [controlId: string]: AssessmentControl;
}

interface AssessmentData {
  id: string;
  name: string;
  organization: string;
  assessor: string;
  scope?: string;
  date: string;
  status: string;
  completion: number;
  score: number;
  controls: {
    [family: string]: AssessmentControlFamily;
  };
}

interface AssessmentResult {
  assessment: AssessmentData;
}

const ExportResults: React.FC = () => {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('json');
  const [previewData, setPreviewData] = useState<string>('');

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    setPreviewData('');
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as AssessmentResult;
        
        // Basic validation that this is an assessment file in v2.html format
        if (!parsed.assessment || !parsed.assessment.id || !parsed.assessment.controls) {
          throw new Error('Invalid assessment file format');
        }
        
        setAssessment(parsed);
        
        // Generate JSON preview
        const previewContent = JSON.stringify(parsed, null, 2);
        setPreviewData(previewContent.length > 1000 
          ? previewContent.substring(0, 1000) + '...' 
          : previewContent);
      } catch (error) {
        console.error('Error parsing assessment file:', error);
        setFileError('Invalid assessment file. Please select a valid JSON assessment file.');
      }
    };
    reader.readAsText(file);
  };

  // Generate CSV export
  const generateCSV = () => {
    if (!assessment) return '';
    
    const headers = ['Family', 'Control ID', 'Title', 'Status', 'Notes'];
    const rows: string[][] = [];
    
    // Process each family and control
    Object.entries(assessment.assessment.controls).forEach(([familyId, familyControls]) => {
      Object.entries(familyControls).forEach(([controlId, control]) => {
        // Get control title from the controlId (would need actual control data)
        // In a real app, you'd use the actual control title from your controls data
        const controlTitle = `${controlId} Control`;
        
        rows.push([
          getFamilyFullName(familyId),
          controlId,
          controlTitle,
          control.status,
          control.notes || ''
        ]);
      });
    });
    
    // Sort by control ID
    rows.sort((a, b) => a[1].localeCompare(b[1]));
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  // Count controls by status
  const countControlsByStatus = () => {
    if (!assessment) return { total: 0, implemented: 0, partiallyImplemented: 0, planned: 0, notImplemented: 0, notApplicable: 0 };
    
    let total = 0;
    let implemented = 0;
    let partiallyImplemented = 0;
    let planned = 0;
    let notImplemented = 0;
    let notApplicable = 0;
    
    // Process each family and control
    Object.values(assessment.assessment.controls).forEach(familyControls => {
      Object.values(familyControls).forEach(control => {
        total++;
        
        switch (control.status) {
          case 'Implemented':
            implemented++;
            break;
          case 'Partially Implemented':
            partiallyImplemented++;
            break;
          case 'Planned':
            planned++;
            break;
          case 'Not Implemented':
            notImplemented++;
            break;
          case 'Not Applicable':
            notApplicable++;
            break;
        }
      });
    });
    
    return { total, implemented, partiallyImplemented, planned, notImplemented, notApplicable };
  };

  // Get score class based on score value (matching v2.html)
  const getScoreClass = (score: number) => {
    if (score < 20) return 'score-critical';
    if (score < 40) return 'score-poor';
    if (score < 60) return 'score-fair';
    if (score < 80) return 'score-good';
    return 'score-excellent';
  };

  // Handle export button click
  const handleExport = () => {
    if (!assessment) {
      alert('Please load an assessment file first');
      return;
    }

    if (exportFormat === 'json') {
      // Export JSON - same as the original file
      const jsonContent = JSON.stringify(assessment, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nist-rmf-assessment-${assessment.assessment.name.replace(/\s+/g, '-').toLowerCase()}-${assessment.assessment.date}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exportFormat === 'csv') {
      const csvContent = generateCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nist-rmf-assessment-${assessment.assessment.name.replace(/\s+/g, '-').toLowerCase()}-${assessment.assessment.date}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF format - in a real app would generate a PDF
      alert('PDF export functionality requires additional libraries. Please use JSON or CSV export options.');
    }
  };

  // Copy to clipboard function
  const handleCopyToClipboard = () => {
    if (!assessment) return;
    
    const jsonContent = JSON.stringify(assessment, null, 2);
    navigator.clipboard.writeText(jsonContent)
      .then(() => {
        alert('JSON data copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Please try again.');
      });
  };

  const stats = countControlsByStatus();

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b">Export Assessment Results</h2>
      <p className="mb-4">Export your assessment data for analysis or backup.</p>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Select Assessment</h3>
          <input 
            type="file" 
            accept=".json" 
            onChange={handleFileUpload}
            className="w-full p-3 border border-input rounded"
          />
          {fileError && <p className="text-destructive text-sm mt-2">{fileError}</p>}
          
          {assessment && (
            <div className="mt-6 p-5 border border-border rounded bg-secondary/20">
              <h4 className="font-bold text-lg mb-3">{assessment.assessment.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Organization:</span>
                  <p className="font-medium">{assessment.assessment.organization}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Assessor:</span>
                  <p className="font-medium">{assessment.assessment.assessor}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Date:</span>
                  <p className="font-medium">{assessment.assessment.date}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Status:</span>
                  <p className="font-medium">{assessment.assessment.status}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <span className="text-sm text-muted-foreground block mb-1">Completion:</span>
                <div className="w-full bg-muted h-3 mt-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full" 
                    style={{ width: `${assessment.assessment.completion}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">0%</span>
                  <span className="text-xs font-medium">{assessment.assessment.completion}%</span>
                  <span className="text-xs text-muted-foreground">100%</span>
                </div>
              </div>
              
              <div className="mt-6">
                <span className="text-sm text-muted-foreground block mb-1">Assessment Score:</span>
                <p className="text-2xl font-bold mt-2">
                  <span className={`score-display ${getScoreClass(assessment.assessment.score)}`}>
                    {assessment.assessment.score}%
                  </span>
                </p>
              </div>
              
              <div className="mt-6">
                <span className="text-sm text-muted-foreground block mb-1">Control Status:</span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                  <div className="text-center p-3 border border-border rounded bg-white">
                    <span className="text-xs text-muted-foreground block mb-1">Implemented</span>
                    <p className="text-xl font-bold">{stats.implemented}</p>
                  </div>
                  <div className="text-center p-3 border border-border rounded bg-white">
                    <span className="text-xs text-muted-foreground block mb-1">Partially</span>
                    <p className="text-xl font-bold">{stats.partiallyImplemented}</p>
                  </div>
                  <div className="text-center p-3 border border-border rounded bg-white">
                    <span className="text-xs text-muted-foreground block mb-1">Planned</span>
                    <p className="text-xl font-bold">{stats.planned}</p>
                  </div>
                  <div className="text-center p-3 border border-border rounded bg-white">
                    <span className="text-xs text-muted-foreground block mb-1">Not Implemented</span>
                    <p className="text-xl font-bold">{stats.notImplemented}</p>
                  </div>
                  <div className="text-center p-3 border border-border rounded bg-white">
                    <span className="text-xs text-muted-foreground block mb-1">Not Applicable</span>
                    <p className="text-xl font-bold">{stats.notApplicable}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 mt-6">
          <h3 className="text-lg font-semibold mb-3">Export Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-secondary/20 p-4 rounded">
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="format" 
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                />
                <span className="font-medium">JSON</span>
              </label>
              <p className="text-sm text-muted-foreground ml-6 mt-1">Complete assessment data in JSON format for backup or import.</p>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="format" 
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                />
                <span className="font-medium">CSV</span>
              </label>
              <p className="text-sm text-muted-foreground ml-6 mt-1">Export controls and status in tabular format.</p>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="format" 
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={() => setExportFormat('pdf')}
                />
                <span className="font-medium">PDF Report</span>
              </label>
              <p className="text-sm text-muted-foreground ml-6 mt-1">Formatted PDF report with assessment details.</p>
            </div>
          </div>
        </div>
        
        {assessment && previewData && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Preview</h3>
            <div className="bg-secondary/20 p-4 rounded font-mono text-sm overflow-auto max-h-[300px] border border-border">
              <pre>{previewData}</pre>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
          {assessment && (
            <>
              <button 
                className="btn"
                onClick={handleCopyToClipboard}
              >
                Copy to Clipboard
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleExport}
              >
                Export {exportFormat.toUpperCase()}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportResults; 