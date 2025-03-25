"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import type { Controls, Control } from "@/lib/utils/controlUtils"

interface AssessmentFormProps {
  controls: Controls
}

export default function AssessmentForm({ controls }: AssessmentFormProps) {
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [selectedFamily, setSelectedFamily] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleResponse = (controlId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [controlId]: value
    }))
  }

  const filteredControls = Object.entries(controls)
    .filter(([family]) => selectedFamily === 'ALL' || family === selectedFamily)
    .flatMap(([_, familyControls]) => 
      Object.values(familyControls).filter(control => 
        searchQuery === '' || 
        control.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <select 
          className="p-2 border rounded"
          value={selectedFamily}
          onChange={(e) => setSelectedFamily(e.target.value)}
        >
          <option value="ALL">All Families</option>
          {Object.keys(controls).map(family => (
            <option key={family} value={family}>{family}</option>
          ))}
        </select>
        <input
          type="text"
          className="p-2 border rounded flex-1"
          placeholder="Search controls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredControls.map(control => (
          <Card key={control.id}>
            <CardHeader>
              <CardTitle className="text-lg">{control.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{control.description}</p>
              <RadioGroup
                value={responses[control.id]}
                onValueChange={(value) => handleResponse(control.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="implemented" id={`${control.id}-implemented`} />
                  <Label htmlFor={`${control.id}-implemented`}>Implemented</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partially" id={`${control.id}-partially`} />
                  <Label htmlFor={`${control.id}-partially`}>Partially Implemented</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-implemented" id={`${control.id}-not-implemented`} />
                  <Label htmlFor={`${control.id}-not-implemented`}>Not Implemented</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 