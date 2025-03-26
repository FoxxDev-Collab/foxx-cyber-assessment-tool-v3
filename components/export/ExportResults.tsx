"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileJson, FileSpreadsheet, FileText, Download, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssessmentResult, ControlStats } from './types';
import { generatePdfDocument, calculatePdfStats } from './pdfUtils';
import { generateCSVPreview, generateCSVContent } from './csvUtils';
import { loadAssessmentData } from './storageUtils';

const ExportResults: React.FC = () => {
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('json');
  const [pdfStyle, setPdfStyle] = useState<string>('standard');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const pdfPreviewRef = useRef<HTMLIFrameElement>(null);

  // Generate preview based on selected format
  const generatePreview = useCallback((data: AssessmentResult, format: string) => {
    if (!data) return;
    
    if (format === 'json') {
      const jsonPreview = JSON.stringify(data, null, 2);
      setPreviewData(jsonPreview.length > 2000 
        ? jsonPreview.substring(0, 2000) + '...\n(Preview truncated)' 
        : jsonPreview);
      setPdfPreviewUrl(null);
    } else if (format === 'csv') {
      setPreviewData(generateCSVPreview(data));
      setPdfPreviewUrl(null);
    } else if (format === 'pdf') {
      setPreviewData('');
      // Generate PDF preview
      try {
        const pdfDoc = generatePdfDocument(data, pdfStyle);
        const pdfBlob = pdfDoc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfPreviewUrl(url);
      } catch (error) {
        console.error('Error generating PDF preview:', error);
        setPreviewData('Error generating PDF preview. Please try downloading directly.');
      }
    }
  }, [generateCSVPreview, pdfStyle]);

  // Load assessment from localStorage
  const loadAssessmentDataFromStorage = useCallback(() => {
    try {
      setLoading(true);
      const assessmentData = loadAssessmentData();
      
      if (assessmentData) {
        setAssessment(assessmentData);
        generatePreview(assessmentData, selectedTab);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading assessment:', error);
      setLoading(false);
    }
  }, [selectedTab, generatePreview]);

  // Load assessment from localStorage when component mounts
  useEffect(() => {
    loadAssessmentDataFromStorage();
  }, [loadAssessmentDataFromStorage]);

  // Handle export button click
  const handleExport = () => {
    if (!assessment) {
      alert('No assessment data available to export');
      return;
    }

    if (selectedTab === 'json') {
      exportJSON();
    } else if (selectedTab === 'csv') {
      exportCSV();
    } else if (selectedTab === 'pdf') {
      exportPDF();
    }
  };

  // Export as JSON
  const exportJSON = () => {
    if (!assessment || !assessment.assessment) return;
    
    const jsonContent = JSON.stringify(assessment, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const organization = assessment.assessment.organization.toLowerCase().replace(/\s+/g, '-');
    const score = assessment.assessment.score;
    link.setAttribute('download', `${organization}-${score}-nist-assessment.json`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as CSV
  const exportCSV = () => {
    if (!assessment || !assessment.assessment) return;
    
    const csvContent = generateCSVContent(assessment);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    
    const organization = assessment.assessment.organization.toLowerCase().replace(/\s+/g, '-');
    link.setAttribute('download', `${organization}-nist-assessment-${assessment.assessment.date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as PDF
  const exportPDF = () => {
    if (!assessment || !assessment.assessment) return;
    
    try {
      const doc = generatePdfDocument(assessment, pdfStyle);
      
      // Save the PDF
      const organization = assessment.assessment.organization.toLowerCase().replace(/\s+/g, '-');
      doc.save(`${organization}-nist-assessment-${assessment.assessment.date}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Update PDF preview when style changes
  useEffect(() => {
    if (selectedTab === 'pdf' && assessment) {
      // Regenerate PDF preview when style changes
      try {
        const pdfDoc = generatePdfDocument(assessment, pdfStyle);
        const pdfBlob = pdfDoc.output('blob');
        
        // Revoke old URL if exists
        if (pdfPreviewUrl) {
          URL.revokeObjectURL(pdfPreviewUrl);
        }
        
        const url = URL.createObjectURL(pdfBlob);
        setPdfPreviewUrl(url);
      } catch (error) {
        console.error('Error updating PDF preview:', error);
      }
    }
  }, [pdfStyle, selectedTab, assessment, pdfPreviewUrl]);

  // Clean up PDF preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setSelectedTab(value);
    if (assessment) {
      generatePreview(assessment, value);
    }
  }, [assessment, generatePreview]);

  // Count controls by status
  const countControlsByStatus = useCallback((): ControlStats => {
    if (!assessment?.assessment?.controls) return { 
      total: 0, 
      implemented: 0, 
      partiallyImplemented: 0, 
      planned: 0, 
      notImplemented: 0, 
      notApplicable: 0 
    };
    
    return calculatePdfStats(assessment.assessment);
  }, [assessment]);

  const stats = countControlsByStatus();

  return (
    <div className="space-y-6">
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assessment data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !assessment ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="mb-4 text-4xl text-muted-foreground">
                <FileJson className="h-16 w-16 mx-auto mb-2 opacity-50" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Assessment Data Found</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                No assessment data could be found in your browser. Complete an assessment first to enable export features.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/assessment'}>
                Go to Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Assessment Summary</CardTitle>
              <CardDescription>
                Overview of assessment for {assessment.assessment.organization}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Organization</div>
                  <div className="font-medium">{assessment.assessment.organization}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Assessor</div>
                  <div className="font-medium">{assessment.assessment.assessor}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Date</div>
                  <div className="font-medium">{assessment.assessment.date}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
                  <div className="font-medium">{assessment.assessment.score}%</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Controls Implemented</div>
                  <div className="font-medium">{stats.implemented} of {stats.total} ({Math.round((stats.implemented / stats.total) * 100) || 0}%)</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Partially Implemented</div>
                  <div className="font-medium">{stats.partiallyImplemented} ({Math.round((stats.partiallyImplemented / stats.total) * 100) || 0}%)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Export Assessment Results</CardTitle>
              <CardDescription>
                Choose an export format to download your assessment results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="json" value={selectedTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="json" className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>JSON</span>
                  </TabsTrigger>
                  <TabsTrigger value="csv" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>CSV</span>
                  </TabsTrigger>
                  <TabsTrigger value="pdf" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>PDF</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="json" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Export as JSON to save all assessment data in a structured format that can be imported later.
                  </div>
                </TabsContent>
                
                <TabsContent value="csv" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Export as CSV for easy import into spreadsheet applications like Excel or Google Sheets.
                  </div>
                </TabsContent>
                
                <TabsContent value="pdf" className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Export as PDF for a professional report that can be easily shared and printed.
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-sm font-medium mb-2 block">PDF Style</label>
                    <Select value={pdfStyle} onValueChange={setPdfStyle}>
                      <SelectTrigger className="w-full md:w-[240px]">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                {/* Preview Container */}
                <div className="rounded-md border bg-muted/50 mt-4">
                  <div className="px-4 py-3 border-b bg-muted/70 text-xs font-medium flex justify-between items-center">
                    <span>Preview</span>
                    {pdfPreviewUrl && (
                      <a 
                        href={pdfPreviewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary flex items-center gap-1 hover:underline text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View full PDF</span>
                      </a>
                    )}
                  </div>
                  
                  {/* Show PDF preview or text preview based on selected tab */}
                  {selectedTab === 'pdf' && pdfPreviewUrl ? (
                    <div className="h-[400px] w-full">
                      <iframe 
                        ref={pdfPreviewRef}
                        src={pdfPreviewUrl} 
                        className="w-full h-full" 
                        title="PDF Preview"
                      />
                    </div>
                  ) : (
                    <pre className="p-4 text-xs overflow-auto max-h-[300px] whitespace-pre-wrap break-all">{previewData}</pre>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={handleExport} 
                    disabled={!assessment}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {selectedTab.toUpperCase()}</span>
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ExportResults; 