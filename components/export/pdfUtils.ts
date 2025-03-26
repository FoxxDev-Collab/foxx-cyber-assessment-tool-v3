"use client"

import jsPDF from 'jspdf';
// Include jspdf-autotable
import 'jspdf-autotable';
import { getFamilyFullName } from '../../lib/utils/controlUtils';
import { AssessmentData, AssessmentResult, ControlStats } from './types';

// Calculate stats for PDF
export const calculatePdfStats = (assessmentData: AssessmentData): ControlStats => {
  let total = 0;
  let implemented = 0;
  let partiallyImplemented = 0;
  let planned = 0;
  let notImplemented = 0;
  let notApplicable = 0;
  
  // Process each family and control
  Object.values(assessmentData.controls).forEach(familyControls => {
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

// Generate PDF document
export const generatePdfDocument = (data: AssessmentResult, pdfStyle: string) => {
  if (!data?.assessment) throw new Error('No assessment data');
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add header with logo placeholder
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80); // Dark blue header
  doc.text('NIST RMF Assessment Report', 105, 15, { align: 'center' });
  
  // Add assessment details
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  // Add report metadata section
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, 20, 182, 40, 2, 2, 'FD');
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  // Left column
  doc.text('Organization:', 20, 30);
  doc.text('Assessor:', 20, 38);
  doc.text('Date of Assessment:', 20, 46);
  
  // Right column
  doc.text('Assessment ID:', 110, 30);
  doc.text('Scope:', 110, 38);
  doc.text('Status:', 110, 46);
  
  // Add assessment values
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  
  // Left column values
  doc.text(data.assessment.organization, 55, 30);
  doc.text(data.assessment.assessor, 55, 38);
  doc.text(data.assessment.date, 55, 46);
  
  // Right column values
  doc.text(data.assessment.id, 145, 30);
  doc.text(data.assessment.scope || 'Not specified', 145, 38);
  doc.text(data.assessment.status, 145, 46);
  
  // Add Score section
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(240, 240, 245);
  doc.roundedRect(14, 65, 182, 25, 2, 2, 'FD');
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Overall Assessment Score:', 20, 75);
  
  // Set score color based on value
  const score = data.assessment.score;
  if (score < 40) {
    doc.setTextColor(192, 57, 43); // Red for low score
  } else if (score < 70) {
    doc.setTextColor(211, 84, 0); // Orange for medium score
  } else {
    doc.setTextColor(39, 174, 96); // Green for high score
  }
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${score}%`, 90, 75);
  
  // Add compliance status counts
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  
  // Calculate stats
  const statsData = calculatePdfStats(data.assessment);
  
  doc.text(`Implemented: ${statsData.implemented} (${Math.round((statsData.implemented / statsData.total) * 100) || 0}%)`, 120, 70);
  doc.text(`Partially Implemented: ${statsData.partiallyImplemented} (${Math.round((statsData.partiallyImplemented / statsData.total) * 100) || 0}%)`, 120, 75);
  doc.text(`Planned: ${statsData.planned} (${Math.round((statsData.planned / statsData.total) * 100) || 0}%)`, 120, 80);
  doc.text(`Not Implemented: ${statsData.notImplemented} (${Math.round((statsData.notImplemented / statsData.total) * 100) || 0}%)`, 120, 85);
  
  // Add controls table
  const tableData: Array<[string, string, string, string, number]> = [];
  
  // Process each family and control
  Object.entries(data.assessment.controls).forEach(([familyId, familyControls]) => {
    Object.entries(familyControls).forEach(([controlId, control]) => {
      tableData.push([
        getFamilyFullName(familyId),
        controlId,
        control.status,
        control.notes || '',
        control.score
      ]);
    });
  });
  
  // Sort by control ID
  tableData.sort((a, b) => a[1].localeCompare(b[1]));
  
  // Configure table style based on selected PDF style
  let tableTheme = 'striped';
  let alternateRowColor = [240, 240, 240];
  
  if (pdfStyle === 'modern') {
    tableTheme = 'grid';
    alternateRowColor = [245, 250, 255];
  } else if (pdfStyle === 'compact') {
    tableTheme = 'plain';
    alternateRowColor = [248, 248, 248];
  }
  
  // Use type assertion for autoTable
  // @ts-expect-error jspdf-autotable is not recognized in the type definitions
  doc.autoTable({
    startY: 95,
    head: [['Control Family', 'Control ID', 'Status', 'Notes', 'Score']],
    body: tableData,
    theme: tableTheme,
    headStyles: {
      fillColor: pdfStyle === 'modern' ? [41, 128, 185] : [52, 73, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: alternateRowColor
    },
    styles: {
      fontSize: pdfStyle === 'compact' ? 8 : 9,
      cellPadding: pdfStyle === 'compact' ? 1 : 3,
    },
    margin: { top: 95 },
    didDrawPage: (data: { pageNumber: number; pageCount: number; settings: { margin: { left: number } } }) => {
      // Add page number at the bottom
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${data.pageNumber} of ${data.pageCount}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
      
      // Add timestamp
      const date = new Date().toLocaleString();
      doc.text(
        `Generated on: ${date}`,
        doc.internal.pageSize.width - 60,
        doc.internal.pageSize.height - 10
      );
    }
  });
  
  return doc;
}; 