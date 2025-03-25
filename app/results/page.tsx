"use client"
import React from 'react';
import ViewResults from '../../components/results/ViewResults';

const ResultsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold">Assessment Results</h2>
        <p className="text-gray-600">View your assessment results and implementation status</p>
      </div>
      
      <ViewResults />
    </div>
  );
};

export default ResultsPage; 