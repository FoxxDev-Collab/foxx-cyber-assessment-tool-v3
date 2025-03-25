"use client"
import React from 'react';
import ExportResults from '../../components/export/ExportResults';

const ExportPage: React.FC = () => {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Export Assessment Results</h1>
      <ExportResults />
    </div>
  );
};

export default ExportPage; 