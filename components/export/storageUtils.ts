"use client"

import { AssessmentResult } from './types';

// Load assessment data from localStorage
export const loadAssessmentData = (): AssessmentResult | null => {
  try {
    // First check if we have an assessment in the export format
    const exportFormat = localStorage.getItem('assessment-export-format');
    if (exportFormat) {
      return JSON.parse(exportFormat);
    }

    // Try the currentAssessment next
    const savedAssessment = localStorage.getItem('currentAssessment');
    if (savedAssessment) {
      const parsedAssessment = JSON.parse(savedAssessment);
      
      // Check if this is already in the expected nested format
      if (parsedAssessment.assessment) {
        return parsedAssessment;
      } else {
        // It's a flat assessment structure - wrap it
        return { assessment: parsedAssessment };
      }
    }
    
    // Try other storage keys as fallback
    const resultsData = localStorage.getItem('cyber-assessment-results');
    if (resultsData) {
      const parsedResults = JSON.parse(resultsData);
      
      // Check if this is already nested with 'assessment'
      if (parsedResults.data && parsedResults.data.assessment) {
        return { assessment: parsedResults.data.assessment };
      } else if (parsedResults.data) {
        return { assessment: parsedResults.data };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading assessment:', error);
    return null;
  }
}; 