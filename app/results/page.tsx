"use client"
import React, { useState, useEffect } from 'react';
import ViewResults from '../../components/results/ViewResults';

export type AssessmentData = {
  status?: string;
  notes?: string;
}

const ResultsPage: React.FC = () => {
  const [debugMode, setDebugMode] = useState(false);
  const [rawData, setRawData] = useState<Record<string, Record<string, unknown>>>({});

  useEffect(() => {
    const checkLocalStorage = () => {
      const data: Record<string, Record<string, unknown>> = {};
      
      // Check all potential assessment data sources
      try {
        const currentAssessment = localStorage.getItem('currentAssessment');
        if (currentAssessment) {
          data.currentAssessment = JSON.parse(currentAssessment);
        }
        
        const cyberAssessmentResults = localStorage.getItem('cyber-assessment-results');
        if (cyberAssessmentResults) {
          data.cyberAssessmentResults = JSON.parse(cyberAssessmentResults);
        }
        
        const cyberAssessmentData = localStorage.getItem('cyber-assessment-data');
        if (cyberAssessmentData) {
          data.cyberAssessmentData = JSON.parse(cyberAssessmentData);
        }
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
      
      setRawData(data);
    };
    
    checkLocalStorage();
  }, []);

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  // Add function to generate the export format that can be shown to the user
  const getExportFormat = () => {
    // Check if we have an assessment-export-format in localStorage
    const exportFormat = localStorage.getItem('assessment-export-format');
    if (exportFormat) {
      try {
        const formatted = JSON.parse(exportFormat);
        return JSON.stringify(formatted, null, 2);
      } catch {
        console.error("Error parsing export format");
        return "Error parsing export format.";
      }
    }
    
    // Fall back to currentAssessment
    const currentAssessment = localStorage.getItem('currentAssessment');
    if (currentAssessment) {
      try {
        let data = JSON.parse(currentAssessment);
        
        // If it's not already in the assessment format, wrap it
        if (!data.assessment) {
          data = { assessment: data };
        }
        
        return JSON.stringify(data, null, 2);
      } catch {
        console.error("Error parsing current assessment");
        return "Error parsing current assessment.";
      }
    }
    
    return "No export format found.";
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Assessment Results</h2>
            <p className="text-gray-600">View your assessment results and implementation status</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => {
                try {
                  // Copy the export format to clipboard
                  navigator.clipboard.writeText(getExportFormat())
                    .then(() => alert("Export format copied to clipboard!"))
                    .catch(() => alert("Failed to copy to clipboard."));
                } catch {
                  alert("Error generating export format.");
                }
              }}
              className="text-xs bg-primary text-white px-2 py-1 rounded"
            >
              Copy JSON
            </button>
            <button 
              onClick={toggleDebugMode}
              className="text-xs text-gray-500 underline"
            >
              {debugMode ? 'Hide Debug' : 'Debug'}
            </button>
          </div>
        </div>
      </div>
      
      {debugMode && (
        <div className="mb-6 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border overflow-auto max-h-[500px]">
            <h3 className="text-lg font-bold mb-2">Debug Data</h3>
            <div className="space-y-4">
              {Object.entries(rawData).map(([key, value]) => (
                <div key={key}>
                  <h4 className="font-medium">{key}</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-[200px]">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border overflow-auto max-h-[500px]">
            <h3 className="text-lg font-bold mb-2">Export Format (matches example-output)</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-[400px]">
              {getExportFormat()}
            </pre>
          </div>
        </div>
      )}
      
      <ViewResults />
    </div>
  );
};

export default ResultsPage; 