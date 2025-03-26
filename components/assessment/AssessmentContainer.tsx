"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { loadAllControls } from '@/lib/controls'
import type { Controls } from '@/lib/utils/controlUtils'
import TabControls from './TabControls'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const ASSESSMENT_STORAGE_KEY = 'cyber-assessment-data';

// Define handle type for forwarded ref
export interface AssessmentContainerHandle {
  saveAssessmentData: () => boolean;
  getAssessmentData: () => Record<string, { status?: string, notes?: string }>;
}

interface AssessmentContainerProps {
  onProgressChange?: (completed: number, total: number) => void;
}

const AssessmentContainer = forwardRef<AssessmentContainerHandle, AssessmentContainerProps>(({ 
  onProgressChange 
}, ref) => {
  const [controls, setControls] = useState<Controls>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assessmentData, setAssessmentData] = useState<Record<string, { status?: string, notes?: string }>>({})
  const [savedTimestamp, setSavedTimestamp] = useState<string | null>(null)
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    saveAssessmentData: () => {
      return saveAssessmentData();
    },
    getAssessmentData: () => {
      return assessmentData;
    }
  }));
  
  // Load controls and saved assessment data
  useEffect(() => {
    const fetchControls = async () => {
      try {
        setLoading(true)
        const data = await loadAllControls()
        setControls(data)
        
        // Load saved assessment data from localStorage if available
        const savedData = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setAssessmentData(parsed.data || {});
            setSavedTimestamp(parsed.timestamp || null);
          } catch (parseError) {
            console.error('Error parsing saved assessment data:', parseError);
          }
        }
        
        setError(null)
      } catch (err) {
        console.error('Error loading controls:', err)
        setError('Failed to load controls. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchControls()
  }, [])
  
  // Handle assessment changes
  const handleAssessmentChange = (data: Record<string, { status?: string, notes?: string }>) => {
    setAssessmentData(data);
  }
  
  // Handle progress tracking
  const handleCompletionChange = (completed: number, total: number) => {
    onProgressChange?.(completed, total);
  }
  
  // Save assessment data
  const saveAssessmentData = () => {
    try {
      const timestamp = new Date().toISOString();
      const dataToSave = {
        data: assessmentData,
        timestamp
      };
      
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(dataToSave));
      setSavedTimestamp(timestamp);
      
      return true;
    } catch (error) {
      console.error('Error saving assessment data:', error);
      return false;
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton 
              key={index} 
              className="h-[300px] w-full rounded-lg" 
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (Object.keys(controls).length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No controls found</AlertTitle>
        <AlertDescription>
          No controls available for assessment.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {savedTimestamp && (
        <div className="mb-4 text-sm text-muted-foreground">
          Last saved: {new Date(savedTimestamp).toLocaleString()}
        </div>
      )}
      
      <TabControls 
        controls={controls} 
        onAssessmentChange={handleAssessmentChange}
        onCompletionChange={handleCompletionChange}
        savedAssessmentData={assessmentData}
      />
    </>
  )
});

AssessmentContainer.displayName = 'AssessmentContainer';

export default AssessmentContainer; 