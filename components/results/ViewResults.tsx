import React, { useState, useEffect } from 'react';
import { getFamilyFullName } from '../../lib/utils/controlUtils';
import DonutChart from '../charts/DonutChart';
import MetricCard from '../ui/MetricCard';

interface AssessmentResult {
  id: string;
  name: string;
  organization: string;
  assessor: string;
  scope: string;
  date: string;
  status: string;
  controls: Record<string, {
    id: string;
    status: string;
    notes: string;
    evidence: string;
  }>;
}

const ViewResults: React.FC = () => {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Load assessment from localStorage when component mounts
  useEffect(() => {
    const loadAssessment = () => {
      try {
        const savedAssessment = localStorage.getItem('currentAssessment');
        if (savedAssessment) {
          const parsedAssessment = JSON.parse(savedAssessment) as AssessmentResult;
          setAssessment(parsedAssessment);
        }
      } catch (error) {
        console.error('Error loading assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, []);

  // Convert controls object to array for easier processing
  const getControlsArray = () => {
    if (!assessment || !assessment.controls) return [];
    
    return Object.values(assessment.controls).map(control => ({
      id: control.id,
      family: control.id.split('-')[0],
      status: control.status,
      notes: control.notes,
      evidence: control.evidence
    }));
  };

  // Calculate compliance statistics
  const calculateStats = (controls: any[]) => {
    const total = controls.length;
    const implemented = controls.filter(c => c.status === 'Implemented').length;
    const partiallyImplemented = controls.filter(c => c.status === 'Partially Implemented').length;
    const planned = controls.filter(c => c.status === 'Planned').length;
    const notImplemented = controls.filter(c => c.status === 'Not Implemented').length;
    const notApplicable = controls.filter(c => c.status === 'Not Applicable').length;
    
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
    switch (status) {
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
    
    const jsonData = JSON.stringify(assessment, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nist-rmf-assessment-${assessment.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
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
                <div key={family} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">
                      {family} - {getFamilyFullName(family)}
                    </h4>
                    <div className="flex items-center">
                      <DonutChart 
                        value={familyStats.implementationRate} 
                        size={40} 
                        strokeWidth={6}
                        primaryColor={getRateColor(familyStats.implementationRate)}
                      />
                      <span className="ml-2 font-bold">{familyStats.implementationRate}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mt-4 text-center text-xs">
                    <div>
                      <div className="font-bold text-green-600">{familyStats.implemented}</div>
                      <div className="text-gray-500">Implemented</div>
                    </div>
                    <div>
                      <div className="font-bold text-orange-500">{familyStats.partiallyImplemented}</div>
                      <div className="text-gray-500">Partially</div>
                    </div>
                    <div>
                      <div className="font-bold text-blue-500">{familyStats.planned}</div>
                      <div className="text-gray-500">Planned</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-500">{familyStats.notImplemented}</div>
                      <div className="text-gray-500">Not Impl.</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-500">{familyStats.notApplicable}</div>
                      <div className="text-gray-500">N/A</div>
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