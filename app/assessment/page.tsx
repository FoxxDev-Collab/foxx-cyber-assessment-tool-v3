"use client"

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AssessmentContainer, { AssessmentContainerHandle, ASSESSMENT_STORAGE_KEY } from '../../components/assessment/AssessmentContainer';
import { Shield, Save, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const assessmentContainerRef = useRef<AssessmentContainerHandle>(null);
  
  // Update progress based on assessment completion
  const handleProgressChange = (completed: number, total: number) => {
    setCompletedControls(completed);
    setTotalControls(total);
    setProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
  };
  
  // Save assessment data
  const handleSaveAssessment = () => {
    if (assessmentContainerRef.current) {
      const success = assessmentContainerRef.current.saveAssessmentData();
      
      if (success) {
        // Also save in the format expected by ViewResults
        try {
          const assessmentData = assessmentContainerRef.current.getAssessmentData();
          const formattedControls = formatControlsByFamily(assessmentData);
          
          // Calculate completion
          const total = Object.keys(assessmentData).length;
          const completed = Object.values(assessmentData).filter(c => c.status && c.status !== 'Not Implemented').length;
          const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
          
          // Create formatted assessment
          const formattedAssessment = {
            id: Date.now().toString(),
            name: document.getElementById('assessment-name')?.innerText || 'Security Assessment',
            organization: document.getElementById('organization-name')?.innerText || 'Your Organization',
            assessor: document.getElementById('assessor-name')?.innerText || 'Security Assessor',
            scope: document.getElementById('assessment-scope')?.innerText || 'Enterprise systems and applications',
            date: new Date().toISOString().split('T')[0],
            status: 'In Progress',
            completion: completionPercentage,
            score: completionPercentage,
            controls: formattedControls
          };
          
          // Save to localStorage
          localStorage.setItem('currentAssessment', JSON.stringify(formattedAssessment));
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
        
        // Get organization details from the UI
        const organization = document.getElementById('organization-name')?.innerText || 'Acme Corporation';
        const assessorName = document.getElementById('assessor-name')?.innerText || 'Security Team';
        const assessmentScope = document.getElementById('assessment-scope')?.innerText || 'Enterprise systems and applications';
        const assessmentName = document.getElementById('assessment-name')?.innerText?.trim() || 'Security Assessment';
        
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
        
        // Calculate progress metrics
        const total = Object.keys(assessmentData).length;
        const completed = Object.values(assessmentData).filter(c => c.status && c.status !== 'Not Implemented').length;
        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Create export format that matches example-output/acme-40-nist-assessment.json
        const exportFormat = {
          assessment: {
            id: Date.now().toString(),
            name: assessmentName,
            organization: organization,
            assessor: assessorName,
            scope: assessmentScope,
            date: new Date().toISOString().split('T')[0],
            status: 'Completed',
            completion: completionPercentage,
            score: completionPercentage,
            controls: controlsByFamily,
            completionDate: new Date().toISOString().split('T')[0]
          }
        };
        
        // Save the export format - this is what will be displayed on the results page
        localStorage.setItem('currentAssessment', JSON.stringify(exportFormat));
        localStorage.setItem('assessment-export-format', JSON.stringify(exportFormat));
        
        // For debugging - print out the formatted JSON in the console
        console.log("Assessment JSON for results page:", JSON.stringify(exportFormat, null, 2));
        
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
        <div>
          <h1 id="assessment-name" className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Security Assessment
          </h1>
          <div className="text-muted-foreground mt-2">
            <p>Organization: <span id="organization-name">Acme Corporation</span></p>
            <p>Assessor: <span id="assessor-name">Security Team</span></p>
            <p>Scope: <span id="assessment-scope">Enterprise systems and applications</span></p>
          </div>
        </div>
        
        <div className="flex gap-2">
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
      
      <div className="mt-8 flex justify-end">
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
    </div>
  )
} 