"use client"

import React, { useState, useEffect } from 'react';
import AssessmentContainer from '../../components/assessment/AssessmentContainer';
import { Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { loadAllControls } from '@/lib/controls'
import { getAllControlIds } from '@/lib/utils/controlUtils'

export default function AssessmentPage() {
  const [progress, setProgress] = useState(0);
  const [totalControls, setTotalControls] = useState(0);
  const [completedControls, setCompletedControls] = useState(0);
  
  // This is a simplified example - in real app, you'd track progress through context or state management
  useEffect(() => {
    const getControlCount = async () => {
      try {
        const controls = await loadAllControls();
        const allControlIds = getAllControlIds(controls);
        setTotalControls(allControlIds.length);
        
        // For now we're setting a random number for demo purposes
        // In a real app, you'd track actual control completion
        const fakeCompleted = Math.floor(Math.random() * 10);
        setCompletedControls(fakeCompleted);
        setProgress(Math.round((fakeCompleted / allControlIds.length) * 100));
      } catch (error) {
        console.error("Failed to load controls for progress", error);
      }
    };
    
    getControlCount();
  }, []);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Cyber Security Assessment
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete the assessment by evaluating each security control
          </p>
        </div>
        
        <div className="flex">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Progress
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
      
      <AssessmentContainer />
    </div>
  )
} 