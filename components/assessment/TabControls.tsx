"use client"

import { useState, useEffect } from "react"
import { getFamilyFullName } from "@/lib/utils/controlUtils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area" 
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import ControlCard from "./ControlCard"
import type { Controls } from "@/lib/utils/controlUtils"

interface TabControlsProps {
  controls: Controls;
  onAssessmentChange?: (data: Record<string, { status?: string, notes?: string }>) => void;
  onCompletionChange?: (completed: number, total: number) => void;
  savedAssessmentData?: Record<string, { status?: string, notes?: string }>;
}

export default function TabControls({ 
  controls, 
  onAssessmentChange,
  onCompletionChange,
  savedAssessmentData = {}
}: TabControlsProps) {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("ALL")
  const [assessmentData, setAssessmentData] = useState<Record<string, { status?: string, notes?: string }>>(savedAssessmentData)
  
  const families = ["ALL", ...Object.keys(controls).sort()]
  
  // Calculate total controls and completed controls
  useEffect(() => {
    const totalControlCount = Object.values(controls).reduce((acc, familyControls) => 
      acc + Object.keys(familyControls).length, 0
    );
    
    const completedCount = Object.values(assessmentData).filter(
      data => data.status && data.status !== ""
    ).length;
    
    onCompletionChange?.(completedCount, totalControlCount);
    onAssessmentChange?.(assessmentData);
  }, [assessmentData, controls, onCompletionChange, onAssessmentChange]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchQuery("")
  }

  const handleStatusChange = (controlId: string, status: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [controlId]: { ...prev[controlId], status }
    }))
  }

  const handleNotesChange = (controlId: string, notes: string) => {
    setAssessmentData(prev => ({
      ...prev,
      [controlId]: { ...prev[controlId], notes }
    }))
  }

  const getFilteredControls = (family: string) => {
    if (family === "ALL") {
      return Object.entries(controls).flatMap(([, familyControls]) => 
        Object.values(familyControls).filter(control => 
          searchQuery === "" || 
          control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          control.description.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(control => ({
          ...control,
          status: assessmentData[control.id]?.status,
          notes: assessmentData[control.id]?.notes
        }))
      )
    } else {
      return Object.values(controls[family] || {}).filter(control => 
        searchQuery === "" || 
        control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(control => ({
        ...control,
        status: assessmentData[control.id]?.status,
        notes: assessmentData[control.id]?.notes
      }))
    }
  }

  const getControlCount = (family: string) => {
    if (family === "ALL") {
      return Object.values(controls).reduce((acc, familyControls) => 
        acc + Object.keys(familyControls).length, 0
      )
    }
    return controls[family] ? Object.keys(controls[family]).length : 0
  }
  
  const getCompletedCount = (family: string) => {
    if (family === "ALL") {
      return Object.keys(assessmentData).filter(controlId => 
        assessmentData[controlId]?.status && assessmentData[controlId]?.status !== ""
      ).length;
    }
    
    return Object.keys(controls[family] || {})
      .filter(controlId => 
        assessmentData[controlId]?.status && assessmentData[controlId]?.status !== ""
      ).length;
  }
  
  const goToNextFamily = () => {
    const currentIndex = families.indexOf(activeTab);
    if (currentIndex < families.length - 1) {
      setActiveTab(families[currentIndex + 1]);
    }
  }
  
  const isCurrentFamilyComplete = () => {
    if (activeTab === "ALL") return false;
    
    const familyControls = Object.keys(controls[activeTab] || {});
    const completedFamilyControls = familyControls.filter(
      controlId => assessmentData[controlId]?.status && assessmentData[controlId]?.status !== ""
    );
    
    return completedFamilyControls.length === familyControls.length && familyControls.length > 0;
  }
  
  const isLastFamily = () => {
    return activeTab === families[families.length - 1];
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-4 items-center mb-6 w-full">
        <Input
          className="w-full"
          placeholder="Search controls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <ScrollArea className="w-full pb-2">
          <TabsList className="h-auto min-h-12 w-full mb-6 flex-wrap">
            {families.map((family) => (
              <TabsTrigger 
                key={family} 
                value={family} 
                className="flex items-center gap-2 py-2 whitespace-nowrap"
              >
                {family === "ALL" ? "All Controls" : (
                  <span className="font-medium uppercase">{family}</span>
                )}
                {isCurrentFamilyComplete() && family !== "ALL" ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-green-600"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ) : (
                  family !== "ALL" && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: getCompletedCount(family) === 0 
                          ? 'rgb(239, 68, 68)' // red
                          : getCompletedCount(family) === getControlCount(family) 
                            ? 'rgb(34, 197, 94)' // green
                            : 'rgb(234, 179, 8)' // yellow/amber
                      }}
                    />
                  )
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {families.map((family) => (
          <TabsContent key={family} value={family} className="space-y-4">
            {family !== "ALL" && (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{getFamilyFullName(family)}</h2>
                  <Badge variant="outline" className={getCompletedCount(family) === getControlCount(family) ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                    {getCompletedCount(family)}/{getControlCount(family)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {getCompletedCount(family) === getControlCount(family) 
                    ? "All controls assessed" 
                    : `${getCompletedCount(family)} of ${getControlCount(family)} controls assessed`}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 w-full">
              {getFilteredControls(family).map((control) => (
                <ControlCard 
                  key={control.id} 
                  control={control}
                  onStatusChange={handleStatusChange}
                  onNotesChange={handleNotesChange} 
                />
              ))}
            </div>
            
            {getFilteredControls(family).length === 0 && (
              <div className="text-center p-10 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No controls found matching your criteria.</p>
              </div>
            )}
            
            {family !== "ALL" && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8">
                <div>
                  {isCurrentFamilyComplete() && (
                    <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {getControlCount(family)} of {getControlCount(family)} controls completed
                    </div>
                  )}
                </div>
                <Button 
                  onClick={goToNextFamily} 
                  disabled={isLastFamily()}
                  className="gap-2 px-4"
                >
                  {isLastFamily() ? "Completed" : "Next Family"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 