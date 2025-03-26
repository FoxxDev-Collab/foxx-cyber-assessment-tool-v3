"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AssessmentContainer, { AssessmentContainerHandle, ASSESSMENT_STORAGE_KEY } from '../../components/assessment/AssessmentContainer';
import { Shield, Save, CheckCircle, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
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

const ASSESSMENT_RESULTS_KEY = 'cyber-assessment-results';

export default function AssessmentPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [totalControls, setTotalControls] = useState(0);
  const [completedControls, setCompletedControls] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const assessmentContainerRef = useRef<AssessmentContainerHandle>(null);
  
  // Add state for editable metadata
  const [organization, setOrganization] = useState('Acme Corporation');
  const [assessor, setAssessor] = useState('Security Team');
  const [scope, setScope] = useState('Enterprise systems and applications');
  const [assessmentName, setAssessmentName] = useState('Security Assessment');
  const [editingMetadata, setEditingMetadata] = useState(false);
  
  // Function to clear all assessment data
  const clearAllData = () => {
    // Clear all assessment-related localStorage items
    localStorage.removeItem('currentAssessment');
    localStorage.removeItem('assessment-export-format');
    localStorage.removeItem(ASSESSMENT_RESULTS_KEY);
    localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    
    // Reset the form state
    setOrganization('Acme Corporation');
    setAssessor('Security Team');
    setScope('Enterprise systems and applications');
    setAssessmentName('Security Assessment');
    setCompletedControls(0);
    setTotalControls(0);
    setProgress(0);
    
    // Reset the assessment container
    if (assessmentContainerRef.current) {
      assessmentContainerRef.current.resetAssessment();
    }
    
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
  
  // Load saved assessment details from localStorage when component mounts
  useEffect(() => {
    try {
      // Check if we have a current assessment with metadata
      const savedAssessment = localStorage.getItem('currentAssessment');
      if (savedAssessment) {
        const parsedAssessment = JSON.parse(savedAssessment);
        
        // If this has the expected structure with assessment metadata
        if (parsedAssessment.assessment) {
          const assessmentData = parsedAssessment.assessment;
          
          // Update state with saved values if they exist
          if (assessmentData.name) setAssessmentName(assessmentData.name);
          if (assessmentData.organization) setOrganization(assessmentData.organization);
          if (assessmentData.assessor) setAssessor(assessmentData.assessor);
          if (assessmentData.scope) setScope(assessmentData.scope);
          
          console.log('Loaded assessment details from localStorage');
        }
      }
    } catch (error) {
      console.error('Error loading assessment details:', error);
    }
  }, []);
  
  // Update progress based on assessment completion
  const handleProgressChange = (completed: number, total: number) => {
    setCompletedControls(completed);
    setTotalControls(total);
    setProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
  };
  
  // Handle toggling metadata editing
  const toggleMetadataEditing = () => {
    setEditingMetadata(!editingMetadata);
  };
  
  // Save assessment data
  const handleSaveAssessment = () => {
    if (assessmentContainerRef.current) {
      const success = assessmentContainerRef.current.saveAssessmentData();
      
      if (success) {
        // Also save in the format expected by ViewResults
        try {
          const assessmentData = assessmentContainerRef.current.getAssessmentData();
          
          // Group controls by family
          const controlsByFamily: Record<string, Record<string, { status: string, notes: string, score: number }>> = {};
          
          // Process each control and organize by family
          Object.entries(assessmentData).forEach(([controlId, controlData]) => {
            const family = controlId.split('-')[0];
            
            // Initialize the family if it doesn't exist
            if (!controlsByFamily[family]) {
              controlsByFamily[family] = {};
            }
            
            // Format the status to match the example output
            let formattedStatus = controlData.status || 'Not Implemented';
            
            // Convert status to match example format (Title Case and remove hyphens)
            switch (formattedStatus.toLowerCase()) {
              case 'implemented':
                formattedStatus = 'Implemented';
                break;
              case 'partially':
              case 'partially-implemented':
              case 'partial':
                formattedStatus = 'Partially Implemented';
                break;
              case 'planned':
                formattedStatus = 'Planned';
                break;
              case 'not-implemented':
              case 'notimplemented':
                formattedStatus = 'Not Implemented';
                break;
              case 'not-applicable':
              case 'notapplicable':
              case 'na':
                formattedStatus = 'Not Applicable';
                break;
              default:
                formattedStatus = 'Not Implemented';
            }
            
            // Add control to its family
            controlsByFamily[family][controlId] = {
              status: formattedStatus,
              notes: controlData.notes || '',
              score: 0 // Score is included but set to 0 to match the example format
            };
          });
          
          // Calculate proper score and completion metrics
          let implementedCount = 0;
          let partiallyImplementedCount = 0;
          let plannedCount = 0;
          let notImplementedCount = 0;
          let notApplicableCount = 0;
          let totalControls = 0;
          
          // Count controls by status
          Object.values(controlsByFamily).forEach(family => {
            Object.values(family).forEach(control => {
              totalControls++;
              
              switch (control.status) {
                case 'Implemented':
                  implementedCount++;
                  break;
                case 'Partially Implemented':
                  partiallyImplementedCount++;
                  break;
                case 'Planned':
                  plannedCount++;
                  break;
                case 'Not Implemented':
                  notImplementedCount++;
                  break;
                case 'Not Applicable':
                  notApplicableCount++;
                  break;
              }
            });
          });
          
          // Calculate score - weight implementation levels differently
          // Implemented = 100%, Partially = 50%, Planned = 25%, Not Implemented = 0%
          const relevantControls = totalControls - notApplicableCount;
          const weightedScore = 
            (implementedCount * 1.0) + 
            (partiallyImplementedCount * 0.5) + 
            (plannedCount * 0.25);
          
          const calculatedScore = relevantControls > 0 
            ? Math.round((weightedScore / relevantControls) * 100) 
            : 0;
          
          // Calculate completion percentage (how many controls have been addressed)
          const completionPercentage = totalControls > 0 
            ? Math.round(((totalControls - notImplementedCount) / totalControls) * 100) 
            : 0;
          
          // Create formatted assessment in the expected format
          const formattedAssessment = {
            assessment: {
              id: Date.now().toString(),
              name: assessmentName,
              organization: organization,
              assessor: assessor,
              scope: scope,
              date: new Date().toISOString().split('T')[0],
              status: 'In Progress',
              completion: completionPercentage,
              score: calculatedScore,
              controls: controlsByFamily
            }
          };
          
          // Save to localStorage
          localStorage.setItem('currentAssessment', JSON.stringify(formattedAssessment));
          
          console.log("Saved assessment with score:", calculatedScore);
        } catch (error) {
          console.error('Error formatting assessment data:', error);
        }
        
        setSaveMessage({
          type: 'success',
          message: `Your assessment progress has been saved (${completedControls} of ${totalControls} controls).`
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({
          type: 'error',
          message: "There was an error saving your assessment data."
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } else {
      setSaveMessage({
        type: 'error',
        message: "No assessment data found to save."
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };
  
  // Finish assessment and go to results
  const handleFinishAssessment = () => {
    if (assessmentContainerRef.current) {
      try {
        // Force save the assessment data first
        assessmentContainerRef.current.saveAssessmentData();
        
        // Get the current assessment data
        const assessmentData = assessmentContainerRef.current.getAssessmentData();
        
        // Group controls by family for the export format (AC-1, AC-2 should go under AC family)
        const controlsByFamily: Record<string, Record<string, { status: string, notes: string, score: number }>> = {};
        
        // Process each control and organize by family
        Object.entries(assessmentData).forEach(([controlId, controlData]) => {
          const family = controlId.split('-')[0];
          
          // Initialize the family if it doesn't exist
          if (!controlsByFamily[family]) {
            controlsByFamily[family] = {};
          }
          
          // Format the status to match the example output
          let formattedStatus = controlData.status || 'Not Implemented';
          
          // Convert status to match example format (Title Case and remove hyphens)
          switch (formattedStatus.toLowerCase()) {
            case 'implemented':
              formattedStatus = 'Implemented';
              break;
            case 'partially':
            case 'partially-implemented':
            case 'partial':
              formattedStatus = 'Partially Implemented';
              break;
            case 'planned':
              formattedStatus = 'Planned';
              break;
            case 'not-implemented':
            case 'notimplemented':
              formattedStatus = 'Not Implemented';
              break;
            case 'not-applicable':
            case 'notapplicable':
            case 'na':
              formattedStatus = 'Not Applicable';
              break;
            default:
              formattedStatus = 'Not Implemented';
          }
          
          // Add control to its family
          controlsByFamily[family][controlId] = {
            status: formattedStatus,
            notes: controlData.notes || '',
            score: 0 // Score is included but set to 0 to match the example format
          };
        });
        
        // Calculate proper score and completion metrics
        let implementedCount = 0;
        let partiallyImplementedCount = 0;
        let plannedCount = 0;
        let notImplementedCount = 0;
        let notApplicableCount = 0;
        let totalControls = 0;
        
        // Count controls by status
        Object.values(controlsByFamily).forEach(family => {
          Object.values(family).forEach(control => {
            totalControls++;
            
            switch (control.status) {
              case 'Implemented':
                implementedCount++;
                break;
              case 'Partially Implemented':
                partiallyImplementedCount++;
                break;
              case 'Planned':
                plannedCount++;
                break;
              case 'Not Implemented':
                notImplementedCount++;
                break;
              case 'Not Applicable':
                notApplicableCount++;
                break;
            }
          });
        });
        
        // Calculate score - weight implementation levels differently
        // Implemented = 100%, Partially = 50%, Planned = 25%, Not Implemented = 0%
        const relevantControls = totalControls - notApplicableCount;
        const weightedScore = 
          (implementedCount * 1.0) + 
          (partiallyImplementedCount * 0.5) + 
          (plannedCount * 0.25);
        
        const calculatedScore = relevantControls > 0 
          ? Math.round((weightedScore / relevantControls) * 100) 
          : 0;
        
        // Calculate completion percentage (how many controls have any status)
        const completionPercentage = totalControls > 0 
          ? Math.round(((totalControls - notImplementedCount) / totalControls) * 100) 
          : 0;

        // Create export format that matches example-output/acme-40-nist-assessment.json
        const exportFormat = {
          assessment: {
            id: Date.now().toString(),
            name: assessmentName,
            organization: organization,
            assessor: assessor,
            scope: scope,
            date: new Date().toISOString().split('T')[0],
            status: 'Completed',
            completion: completionPercentage,
            score: calculatedScore,
            controls: controlsByFamily,
            completionDate: new Date().toISOString().split('T')[0]
          }
        };
        
        // Save the export format - this is what will be displayed on the results page
        localStorage.setItem('currentAssessment', JSON.stringify(exportFormat));
        localStorage.setItem('assessment-export-format', JSON.stringify(exportFormat));
        
        // For debugging - print out the formatted JSON in the console
        console.log("Assessment JSON for results page:", JSON.stringify(exportFormat, null, 2));
        console.log("Assessment metrics:", {
          total: totalControls,
          implemented: implementedCount,
          partiallyImplemented: partiallyImplementedCount,
          planned: plannedCount,
          notImplemented: notImplementedCount,
          notApplicable: notApplicableCount,
          score: calculatedScore,
          completion: completionPercentage
        });
        
        // Also save using the established key for compatibility
        localStorage.setItem(ASSESSMENT_RESULTS_KEY, JSON.stringify({
          data: exportFormat,
          completedAt: new Date().toISOString(),
          progress: {
            completed: completedControls, 
            total: totalControls,
            percentage: progress
          }
        }));
        
        // Show a message before redirecting
        setSaveMessage({
          type: 'success',
          message: `Assessment completed! Redirecting to results...`
        });
        
        // Navigate to results page after a short delay to show the success message
        setTimeout(() => {
          router.push('/results');
        }, 1000);
      } catch (error) {
        console.error('Error processing assessment data:', error);
        setSaveMessage({
          type: 'error',
          message: "There was an error processing your assessment data."
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } else {
      setSaveMessage({
        type: 'error',
        message: "Complete at least some controls before finishing the assessment."
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };
  
  // Format the controls by family for the expected output structure
  const formatControlsByFamily = (assessmentData: Record<string, { status?: string, notes?: string }>) => {
    // Create a flat controls structure that matches the example output format
    const formattedControls: Record<string, { status: string, notes: string, score: number }> = {};
    
    // Process each control
    Object.entries(assessmentData).forEach(([controlId, controlData]) => {
      // Format the status to match the example output
      let formattedStatus = controlData.status || 'Not Implemented';
      
      // Convert status to match example format (Title Case and remove hyphens)
      switch (formattedStatus.toLowerCase()) {
        case 'implemented':
          formattedStatus = 'Implemented';
          break;
        case 'partially':
        case 'partially-implemented':
        case 'partial':
          formattedStatus = 'Partially Implemented';
          break;
        case 'planned':
          formattedStatus = 'Planned';
          break;
        case 'not-implemented':
        case 'notimplemented':
          formattedStatus = 'Not Implemented';
          break;
        case 'not-applicable':
        case 'notapplicable':
        case 'na':
          formattedStatus = 'Not Applicable';
          break;
        default:
          formattedStatus = 'Not Implemented';
      }
      
      // Add each control directly to the controls object
      formattedControls[controlId] = {
        status: formattedStatus,
        notes: controlData.notes || '',
        score: 0 // Score is included but not used in this implementation
      };
    });
    
    return formattedControls;
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {saveMessage && (
        <div className={`mb-4 p-3 rounded-md flex items-start justify-between ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <p>{saveMessage.message}</p>
          <button 
            onClick={() => setSaveMessage(null)}
            className="text-sm hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="w-full">
          {editingMetadata ? (
            <div className="mb-4 space-y-3 bg-gray-50 p-4 rounded-lg border">
              <div>
                <label htmlFor="assessment-name-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Name
                </label>
                <Input 
                  id="assessment-name-input"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="w-full"
                  placeholder="Enter assessment name"
                />
              </div>
              <div>
                <label htmlFor="organization-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <Input 
                  id="organization-input"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full"
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <label htmlFor="assessor-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Assessor
                </label>
                <Input 
                  id="assessor-input"
                  value={assessor}
                  onChange={(e) => setAssessor(e.target.value)}
                  className="w-full"
                  placeholder="Enter assessor name"
                />
              </div>
              <div>
                <label htmlFor="scope-input" className="block text-sm font-medium text-gray-700 mb-1">
                  Scope
                </label>
                <Input 
                  id="scope-input"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full"
                  placeholder="Enter assessment scope"
                />
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMetadataEditing}
                >
                  Save Details
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  {assessmentName}
                </h1>
                <button 
                  onClick={toggleMetadataEditing}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                  title="Edit assessment details"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p><span className="font-medium">Organization:</span> {organization}</p>
                <p><span className="font-medium">Assessor:</span> {assessor}</p>
                <p><span className="font-medium">Scope:</span> {scope}</p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          <Button 
            className="gap-2" 
            variant="outline"
            onClick={handleSaveAssessment}
          >
            <Save className="h-4 w-4" />
            Save Progress
          </Button>
          
          <Button 
            className="gap-2" 
            onClick={() => setShowFinishDialog(true)}
            disabled={completedControls === 0}
          >
            <CheckCircle className="h-4 w-4" />
            Finish Assessment
          </Button>
          
          <Button 
            className="gap-2" 
            variant="destructive"
            onClick={() => setShowClearDataDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            Clear Data
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Assessment Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedControls} of {totalControls} controls ({progress}% Complete)
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <AssessmentContainer 
        ref={assessmentContainerRef}
        onProgressChange={handleProgressChange} 
      />
      
      <div className="mt-8 flex justify-between">
        <Button 
          className="gap-2" 
          variant="outline"
          onClick={() => setShowClearDataDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
          Clear Assessment Data
        </Button>
        
        <Button 
          className="gap-2" 
          onClick={() => setShowFinishDialog(true)}
          disabled={completedControls === 0}
        >
          Finish Assessment
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Finish Assessment Dialog */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You've completed {completedControls} out of {totalControls} controls ({progress}%).
              {progress < 100 && " Some controls are still not assessed."}
              {"\n"}
              Are you sure you want to finish the assessment and view results?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinishAssessment}>
              Proceed to Results
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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
  )
} 