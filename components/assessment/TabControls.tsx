"use client"

import { useState } from "react"
import { getFamilyFullName } from "@/lib/utils/controlUtils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area" 
import { Badge } from "@/components/ui/badge"
import ControlCard from "./ControlCard"
import type { Controls, Control } from "@/lib/utils/controlUtils"

interface TabControlsProps {
  controls: Controls
}

export default function TabControls({ controls }: TabControlsProps) {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("ALL")
  const [assessmentData, setAssessmentData] = useState<Record<string, { status?: string, notes?: string }>>({})
  
  const families = ["ALL", ...Object.keys(controls).sort()]
  
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
      return Object.entries(controls).flatMap(([_, familyControls]) => 
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

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center mb-6">
        <Input
          className="max-w-md"
          placeholder="Search controls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="h-12 w-full mb-6 overflow-x-auto">
            {families.map((family) => (
              <TabsTrigger key={family} value={family} className="flex items-center gap-2">
                {family === "ALL" ? "All Controls" : (
                  <span className="font-medium uppercase">{family}</span>
                )}
                <Badge variant="secondary">
                  {getControlCount(family)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {families.map((family) => (
          <TabsContent key={family} value={family} className="space-y-4">
            {family !== "ALL" && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">{getFamilyFullName(family)}</h2>
                <p className="text-sm text-muted-foreground">
                  {getControlCount(family)} controls in this family
                </p>
              </div>
            )}
            
            <div className="grid gap-4">
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
} 