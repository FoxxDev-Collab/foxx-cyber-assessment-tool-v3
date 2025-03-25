"use client"

import { useState, useEffect } from 'react'
import { loadAllControls } from '@/lib/controls'
import type { Controls } from '@/lib/utils/controlUtils'
import TabControls from './TabControls'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AssessmentContainer() {
  const [controls, setControls] = useState<Controls>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchControls = async () => {
      try {
        setLoading(true)
        const data = await loadAllControls()
        setControls(data)
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

  return <TabControls controls={controls} />
} 