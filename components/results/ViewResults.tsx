import React, { useState, useEffect } from 'react';
import { getFamilyFullName } from '../../lib/utils/controlUtils';
import DonutChart from '../charts/DonutChart';
import MetricCard from '../ui/MetricCard';

interface AssessmentControl {
  status: string;
  notes: string;
  score: number;
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
  const calculateStats = (controls: Array<{ id: string; family: string; status: string; notes: string; evidence: string }>) => {
    // Count controls by status
    const statusCounts: Record<string, number> = {
      'Implemented': 0,
      'Partially Implemented': 0,
      'Planned': 0,
      'Not Implemented': 0,
      'Not Applicable': 0
    };
    
    controls.forEach(control => {
      const normalizedStatus = normalizeStatus(control.status);
      statusCounts[normalizedStatus]++;
    });
    
    const total = controls.length;
    const implemented = statusCounts['Implemented'];
    const partiallyImplemented = statusCounts['Partially Implemented'];
    const planned = statusCounts['Planned'];
    const notImplemented = statusCounts['Not Implemented'];
    const notApplicable = statusCounts['Not Applicable'];
    
    // Calculate the implementation rate (weighted score)
    // Implemented = 100%, Partially = 50%, Planned = 25%, Not Implemented = 0%, Not Applicable = excluded
    const relevantControls = total - notApplicable;
    const weightedScore = 
      (implemented * 1.0) + 
      (partiallyImplemented * 0.5) + 
      (planned * 0.25);
    
    const implementationRate = relevantControls > 0 ? 
      Math.round((weightedScore / relevantControls) * 100) : 0;
    
    // Calculate the completion rate (how many controls have been addressed at all)
    const completionRate = total > 0 ?
      Math.round(((total - notImplemented) / total) * 100) : 0;
    
    return {
      total,
      implemented,
      partiallyImplemented,
      planned,
      notImplemented,
      notApplicable,
      implementationRate,
      completionRate
    };
  };

  // Group controls by family
  const groupControlsByFamily = (controls: Array<{ id: string; family: string; status: string; notes: string; evidence: string }>) => {
    const grouped: Record<string, Array<{ id: string; family: string; status: string; notes: string; evidence: string }>> = {};
    controls.forEach(control => {
      const family = control.family;
      if (!grouped[family]) {
        grouped[family] = [];
      }
      grouped[family].push(control);
    });
    return grouped;
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
    
    // Calculate the score based on the controls data if needed
    const controlsArray = getControlsArray();
    const stats = calculateStats(controlsArray);
    
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
        completion: stats.completionRate,
        score: stats.implementationRate,
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
      stats.implementationRate
    }-nist-assessment.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function for status badge colors
  const getStatusBadgeClass = (status: string): string => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'Implemented':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Partially Implemented':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Not Implemented':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Not Applicable':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-card text-card-foreground rounded-lg shadow-sm border p-6 flex justify-center items-center h-40">
        <p>Loading assessment data...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="bg-card text-card-foreground rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold mb-4">No Assessment Data</h3>
        <p className="text-muted-foreground mb-4">No assessment data was found.</p>
        <p className="text-sm text-muted-foreground">Start by creating a new assessment from the homepage or import a previous assessment.</p>
        <div className="mt-4">
          <button
            onClick={handleBackToAssessment}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  const controlsArray = getControlsArray();
  const stats = calculateStats(controlsArray);

  return (
    <div className="space-y-6">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{assessment.name}</h2>
            <p className="text-muted-foreground">Organization: {assessment.organization}</p>
            <p className="text-muted-foreground">Assessor: {assessment.assessor}</p>
            <p className="text-muted-foreground">Scope: {assessment.scope}</p>
            <p className="text-muted-foreground">Date: {new Date(assessment.date).toLocaleDateString()}</p>
          </div>
          
          {controlsArray.length > 0 && (
            <div className="mt-6 md:mt-0 flex flex-col items-center">
              <DonutChart 
                value={stats.implementationRate} 
                size={140} 
                primaryColor={getRateColor(stats.implementationRate)}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.implementationRate}%</div>
                  <div className="text-xs text-muted-foreground">Security Score</div>
                </div>
              </DonutChart>
              <div className="text-sm text-muted-foreground mt-2 text-center">
                <div>Completion: <span className="font-semibold">{stats.completionRate}%</span></div>
                <div className="text-xs mt-1">Score is weighted by implementation level</div>
              </div>
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
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Back to Assessment
              </button>
              <button
                onClick={handleExportAssessment}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Export as JSON
              </button>
            </div>
          </div>
        )}
      </div>
      
      {controlsArray.length > 0 && (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Control Families</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(groupControlsByFamily(controlsArray)).map(([family, controls]) => {
              const familyStats = calculateStats(controls);
              return (
                <div key={family} className="border rounded-md p-4 bg-background">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{getFamilyFullName(family)}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(normalizeStatus(familyStats.implementationRate >= 80 ? 'Implemented' : familyStats.implementationRate >= 50 ? 'Partially Implemented' : 'Not Implemented'))}`}>
                      {familyStats.implementationRate}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${familyStats.implementationRate}%` }}
                    ></div>
                  </div>
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-600 mr-2"></div>
                      <span>Implemented: {familyStats.implemented}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 dark:bg-orange-600 mr-2"></div>
                      <span>Partial: {familyStats.partiallyImplemented}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-600 mr-2"></div>
                      <span>Planned: {familyStats.planned}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-600 mr-2"></div>
                      <span>Not Impl: {familyStats.notImplemented}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional assessments sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold mb-4">Assessment Summary</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Controls</h4>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Implementation Rate</h4>
              <div className="flex items-center">
                <div className="w-full bg-muted rounded-full h-4 mr-4">
                  <div 
                    className="h-4 rounded-full" 
                    style={{ 
                      width: `${stats.implementationRate}%`,
                      backgroundColor: getRateColor(stats.implementationRate)
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{stats.implementationRate}%</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Controls Pending Action</h4>
              <p className="text-xl font-bold">{stats.total - stats.implemented - stats.notApplicable}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold mb-4">Control Distribution</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded p-3 bg-background">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Implemented</h4>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-bold">{stats.implemented}</div>
                <div className="text-xs text-muted-foreground">{Math.round((stats.implemented / stats.total) * 100)}%</div>
              </div>
            </div>
            <div className="border rounded p-3 bg-background">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Partially</h4>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-bold">{stats.partiallyImplemented}</div>
                <div className="text-xs text-muted-foreground">{Math.round((stats.partiallyImplemented / stats.total) * 100)}%</div>
              </div>
            </div>
            <div className="border rounded p-3 bg-background">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Planned</h4>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-bold">{stats.planned}</div>
                <div className="text-xs text-muted-foreground">{Math.round((stats.planned / stats.total) * 100)}%</div>
              </div>
            </div>
            <div className="border rounded p-3 bg-background">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Not Implemented</h4>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-bold">{stats.notImplemented}</div>
                <div className="text-xs text-muted-foreground">{Math.round((stats.notImplemented / stats.total) * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={handleBackToAssessment}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm hover:bg-secondary/90"
        >
          Back to Assessment
        </button>
        <button
          onClick={handleExportAssessment}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90"
        >
          Export Assessment
        </button>
      </div>
    </div>
  );
};

export default ViewResults; 