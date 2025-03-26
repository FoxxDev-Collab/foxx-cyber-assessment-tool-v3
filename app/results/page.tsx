"use client"
import React, { useState, useEffect } from 'react';
import ViewResults from '../../components/results/ViewResults';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type AssessmentData = {
  status?: string;
  notes?: string;
}

// Define constants for localStorage keys
const ASSESSMENT_RESULTS_KEY = 'cyber-assessment-results';
const ASSESSMENT_STORAGE_KEY = 'cyber-assessment-data';

const ResultsPage: React.FC = () => {
  const [debugMode, setDebugMode] = useState(false);
  const [rawData, setRawData] = useState<Record<string, Record<string, unknown>>>({});
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const checkLocalStorage = () => {
      const data: Record<string, Record<string, unknown>> = {};
      
      // Check all potential assessment data sources
      try {
        const currentAssessment = localStorage.getItem('currentAssessment');
        if (currentAssessment) {
          data.currentAssessment = JSON.parse(currentAssessment);
        }
        
        const cyberAssessmentResults = localStorage.getItem(ASSESSMENT_RESULTS_KEY);
        if (cyberAssessmentResults) {
          data.cyberAssessmentResults = JSON.parse(cyberAssessmentResults);
        }
        
        const cyberAssessmentData = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
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

  // Function to clear all assessment data
  const clearAllData = () => {
    // Clear all assessment-related localStorage items
    localStorage.removeItem('currentAssessment');
    localStorage.removeItem('assessment-export-format');
    localStorage.removeItem(ASSESSMENT_RESULTS_KEY);
    localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    
    // Show success message
    setSaveMessage({
      type: 'success',
      message: 'All assessment data has been cleared. Your session data has been completely removed.'
    });
    
    // Close the dialog
    setShowClearDataDialog(false);
    
    // Clear message after 5 seconds
    setTimeout(() => setSaveMessage(null), 5000);
    
    // Refresh the page to ensure all components reload with fresh state
    setTimeout(() => {
      window.location.reload();
    }, 1500);
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
      {saveMessage && (
        <div className={`mb-4 p-3 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
          {saveMessage.message}
        </div>
      )}
      
      <div className="mb-6 bg-card text-card-foreground p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Assessment Results</h2>
            <p className="text-muted-foreground">View your assessment results and implementation status</p>
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
              className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
            >
              Copy JSON
            </button>
            <button 
              onClick={toggleDebugMode}
              className="text-xs text-muted-foreground underline"
            >
              {debugMode ? 'Hide Debug' : 'Debug'}
            </button>
            <button
              onClick={() => setShowClearDataDialog(true)}
              className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Clear Data
            </button>
          </div>
        </div>
      </div>
      
      {debugMode && (
        <div className="mb-6 space-y-4">
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border overflow-auto max-h-[500px]">
            <h3 className="text-lg font-bold mb-2">Debug Data</h3>
            <div className="space-y-4">
              {Object.entries(rawData).map(([key, value]) => (
                <div key={key}>
                  <h4 className="font-medium">{key}</h4>
                  <pre className="bg-muted text-muted-foreground p-3 rounded text-xs overflow-auto max-h-[200px]">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm border overflow-auto max-h-[500px]">
            <h3 className="text-lg font-bold mb-2">Export Format (matches example-output)</h3>
            <pre className="bg-muted text-muted-foreground p-3 rounded text-xs overflow-auto max-h-[400px]">
              {getExportFormat()}
            </pre>
          </div>
        </div>
      )}
      
      <ViewResults />
      
      {/* Clear Data Dialog */}
      <AlertDialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete All Assessment Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all assessment data from your browser, including:
            </AlertDialogDescription>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Current assessment progress</li>
              <li>Organization and assessor information</li>
              <li>All control evaluations and notes</li>
              <li>Exported results and reports</li>
            </ul>
            <p className="mt-2 font-medium text-sm text-muted-foreground">This action cannot be undone.</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={clearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResultsPage; 