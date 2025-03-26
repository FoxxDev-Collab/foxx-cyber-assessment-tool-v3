import React, { useState, useEffect } from 'react';
import { getFamilyFullName } from '../../lib/utils/controlUtils';
import DonutChart from '../charts/DonutChart';
import MetricCard from '../ui/MetricCard';

interface AssessmentControl {
  status: string;
  notes: string;
  score: number;
}

interface AssessmentControlFamily {
  [controlId: string]: AssessmentControl;
}

interface AssessmentResult {
  id: string;
  name: string;
  organization: string;
  assessor: string;
  scope: string;
  date: string;
  status: string;
  completion?: number;
  score?: number;
  controls: Record<string, {
    id: string;
    status: string;
    notes: string;
    evidence: string;
  }>;
}

interface FormattedAssessmentResult {
  id: string;
  name: string;
  organization: string;
  assessor: string;
  scope: string;
  date: string;
  status: string;
  completion: number;
  score: number;
  controls: Record<string, Record<string, AssessmentControl>>;
}

const ViewResults: React.FC = () => {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Load assessment from localStorage when component mounts
  useEffect(() => {
    const loadAssessment = () => {
      try {
        // First check if we have an assessment in the export format
        const exportFormat = localStorage.getItem('assessment-export-format');
        if (exportFormat) {
          console.log("Loading from assessment-export-format");
          const parsedExport = JSON.parse(exportFormat);
          console.log("Export format found:", parsedExport);
          setAssessment(parsedExport.assessment);
          return;
        }

        // Try the currentAssessment next
        const savedAssessment = localStorage.getItem('currentAssessment');
        if (savedAssessment) {
          console.log("Loading from currentAssessment");
          const parsedAssessment = JSON.parse(savedAssessment);
          
          // Check if this is already in the expected nested format
          if (parsedAssessment.assessment) {
            console.log("Found nested assessment structure:", parsedAssessment);
            setAssessment(parsedAssessment.assessment);
          } else {
            // It's a flat assessment structure
            console.log("Found flat assessment structure:", parsedAssessment);
            setAssessment(parsedAssessment);
          }
          return;
        }
        
        // Try cyber-assessment-results as fallback
        const resultsData = localStorage.getItem('cyber-assessment-results');
        if (resultsData) {
          console.log("Loading from cyber-assessment-results");
          const parsedResults = JSON.parse(resultsData);
          console.log("Results data:", parsedResults);
          
          // Check if this is already nested with 'assessment'
          if (parsedResults.data && parsedResults.data.assessment) {
            setAssessment(parsedResults.data.assessment);
          } else if (parsedResults.data) {
            setAssessment(parsedResults.data);
          }
          return;
        }
        
        // Last resort - try cyber-assessment-data
        const assessmentData = localStorage.getItem('cyber-assessment-data');
        if (assessmentData) {
          console.log("Loading from cyber-assessment-data (raw format)");
          const parsedData = JSON.parse(assessmentData);
          
          // This needs full conversion
          if (parsedData.data) {
            const formattedAssessment = formatAssessmentData(parsedData.data);
            setAssessment(formattedAssessment as unknown as AssessmentResult);
          }
        }
      } catch (error) {
        console.error('Error loading assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, []);

  // Format assessment data from the cyber-assessment-data format to match expected results format
  const formatAssessmentData = (data: Record<string, { status?: string, notes?: string }>): FormattedAssessmentResult => {
    // Generate a formatted assessment object with appropriate structure
    const now = new Date();
    const formattedControls: Record<string, Record<string, AssessmentControl>> = {};
    
    // Group controls by family
    Object.entries(data).forEach(([controlId, controlData]) => {
      const family = controlId.split('-')[0];
      if (!formattedControls[family]) {
        formattedControls[family] = {};
      }
      
      formattedControls[family][controlId] = {
        status: controlData.status || 'Not Implemented',
        notes: controlData.notes || '',
        score: 0
      };
    });
    
    // Calculate completion percentage
    const total = Object.keys(data).length;
    const completed = Object.values(data).filter(c => c.status && c.status !== 'Not Implemented').length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Create the formatted assessment
    return {
      id: Date.now().toString(),
      name: 'Security Assessment',
      organization: 'Your Organization',
      assessor: 'Security Team',
      scope: 'Enterprise systems and applications',
      date: now.toISOString().split('T')[0],
      status: 'Completed',
      completion: completionPercentage,
      score: completionPercentage,
      controls: formattedControls
    };
  };

  // Convert controls object to array for easier processing
  const getControlsArray = () => {
    if (!assessment || !assessment.controls) {
      console.log("No assessment or controls found");
      return [];
    }
    
    console.log("Processing controls:", assessment.controls);
    
    interface ControlData {
      status: string;
      notes: string;
      score: number;
    }
    
    const controlsArray: Array<{
      id: string;
      family: string;
      status: string;
      notes: string;
      evidence: string;
    }> = [];
    
    // Check if we have the format from the example output (nested by family)
    // The example format has controls grouped by family, e.g., AC: { AC-1: {...}, AC-2: {...} }
    Object.entries(assessment.controls).forEach(([family, familyControls]) => {
      console.log(`Processing family ${family}:`, familyControls);
      
      if (typeof familyControls === 'object' && familyControls !== null) {
        // Process each control in the family
        Object.entries(familyControls as Record<string, unknown>).forEach(([controlId, control]) => {
          const controlData = control as ControlData;
          if (typeof control === 'object' && control !== null && 'status' in controlData) {
            console.log(`Adding control ${controlId} with status ${controlData.status}`);
            controlsArray.push({
              id: controlId,
              family: family,
              status: controlData.status,
              notes: controlData.notes || '',
              evidence: ''
            });
          }
        });
      }
    });
    
    console.log("Processed controls array:", controlsArray);
    return controlsArray;
  };

  // Normalize status values to match the expected format
  const normalizeStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'implemented':
        return 'Implemented';
      case 'partially':
      case 'partially-implemented':
      case 'partial':
        return 'Partially Implemented';
      case 'planned':
        return 'Planned';
      case 'not-implemented':
      case 'notimplemented':
        return 'Not Implemented';
      case 'not-applicable':
      case 'notapplicable':
      case 'na':
        return 'Not Applicable';
      default:
        return 'Not Implemented';
    }
  };

  // Calculate compliance statistics
  const calculateStats = (controls: any[]) => {
    const total = controls.length;
    const implemented = controls.filter(c => normalizeStatus(c.status) === 'Implemented').length;
    const partiallyImplemented = controls.filter(c => normalizeStatus(c.status) === 'Partially Implemented').length;
    const planned = controls.filter(c => normalizeStatus(c.status) === 'Planned').length;
    const notImplemented = controls.filter(c => normalizeStatus(c.status) === 'Not Implemented').length;
    const notApplicable = controls.filter(c => normalizeStatus(c.status) === 'Not Applicable').length;
    
    const implementationRate = total > 0 ? 
      Math.round(((implemented + (partiallyImplemented * 0.5) + (planned * 0.25)) / (total - notApplicable)) * 100) : 0;
    
    return {
      total,
      implemented,
      partiallyImplemented,
      planned,
      notImplemented,
      notApplicable,
      implementationRate
    };
  };

  // Group controls by family
  const groupControlsByFamily = (controls: any[]) => {
    const grouped: Record<string, any[]> = {};
    controls.forEach(control => {
      const family = control.family;
      if (!grouped[family]) {
        grouped[family] = [];
      }
      grouped[family].push(control);
    });
    return grouped;
  };

  // Get color based on status
  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-700';
    
    switch (normalizeStatus(status)) {
      case 'Implemented': return 'text-green-600';
      case 'Partially Implemented': return 'text-orange-500';
      case 'Planned': return 'text-blue-500';
      case 'Not Implemented': return 'text-red-500';
      case 'Not Applicable': return 'text-gray-500';
      default: return 'text-gray-700';
    }
  };

  // Get implementation rate color
  const getRateColor = (rate: number) => {
    if (rate >= 80) return '#10b981'; // green-500
    if (rate >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  // Handle going back to the assessment
  const handleBackToAssessment = () => {
    window.location.href = '/';
  };

  // Handle export of assessment data
  const handleExportAssessment = () => {
    if (!assessment) return;
    
    // Format the assessment data to match the example output format
    const formattedAssessment = {
      assessment: {
        id: assessment.id,
        name: assessment.name,
        organization: assessment.organization,
        assessor: assessment.assessor,
        scope: assessment.scope,
        date: assessment.date,
        status: assessment.status,
        completion: assessment.completion || 0,
        score: assessment.score || 0,
        controls: assessment.controls,
        completionDate: new Date().toISOString().split('T')[0]
      }
    };
    
    const jsonData = JSON.stringify(formattedAssessment, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assessment.organization.toLowerCase().replace(/\s+/g, '-')}-${
      assessment.score || 0
    }-nist-assessment.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="card p-6 text-center">
        <p>Loading assessment results...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-4">No Assessment Data Available</h2>
        <p className="mb-4">There is no assessment data to display. Please complete an assessment first.</p>
        <button
          onClick={handleBackToAssessment}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Back to Assessment
        </button>
      </div>
    );
  }

  const controlsArray = getControlsArray();
  const stats = calculateStats(controlsArray);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{assessment.name}</h2>
            <p className="text-gray-600">Organization: {assessment.organization}</p>
            <p className="text-gray-600">Assessor: {assessment.assessor}</p>
            <p className="text-gray-600">Scope: {assessment.scope}</p>
            <p className="text-gray-600">Date: {new Date(assessment.date).toLocaleDateString()}</p>
          </div>
          
          {controlsArray.length > 0 && (
            <div className="mt-6 md:mt-0">
              <DonutChart 
                value={stats.implementationRate} 
                size={120} 
                primaryColor={getRateColor(stats.implementationRate)}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.implementationRate}%</div>
                  <div className="text-xs text-gray-500">Implementation</div>
                </div>
              </DonutChart>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-4">Implementation Summary</h3>
        
        {controlsArray.length === 0 ? (
          <p>No controls in this assessment.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard
                title="Implemented"
                value={stats.implemented}
                color="text-green-600"
                description={`${Math.round((stats.implemented / stats.total) * 100)}% of controls`}
              />
              <MetricCard
                title="Partially Implemented"
                value={stats.partiallyImplemented}
                color="text-orange-500"
                description={`${Math.round((stats.partiallyImplemented / stats.total) * 100)}% of controls`}
              />
              <MetricCard
                title="Planned"
                value={stats.planned}
                color="text-blue-500"
                description={`${Math.round((stats.planned / stats.total) * 100)}% of controls`}
              />
              <MetricCard
                title="Not Implemented"
                value={stats.notImplemented}
                color="text-red-500"
                description={`${Math.round((stats.notImplemented / stats.total) * 100)}% of controls`}
              />
              <MetricCard
                title="Not Applicable"
                value={stats.notApplicable}
                color="text-gray-500"
                description={`${Math.round((stats.notApplicable / stats.total) * 100)}% of controls`}
              />
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleBackToAssessment}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Back to Assessment
              </button>
              <button
                onClick={handleExportAssessment}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Export as JSON
              </button>
            </div>
          </div>
        )}
      </div>
      
      {controlsArray.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Control Families</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(groupControlsByFamily(controlsArray)).map(([family, controls]) => {
              const familyStats = calculateStats(controls);
              return (
                <div key={family} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{getFamilyFullName(family)}</h4>
                    <span className={getStatusColor()}>
                      {familyStats.implementationRate}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${familyStats.implementationRate}%` }}
                    ></div>
                  </div>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Implemented: {familyStats.implemented}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span>Partial: {familyStats.partiallyImplemented}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span>Planned: {familyStats.planned}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Not Impl: {familyStats.notImplemented}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewResults; 