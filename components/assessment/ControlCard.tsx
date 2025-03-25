"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Control } from "@/lib/utils/controlUtils"

export interface ControlCardProps {
  control: Control
  onStatusChange?: (controlId: string, value: string) => void
  onNotesChange?: (controlId: string, notes: string) => void
}

export default function ControlCard({ 
  control, 
  onStatusChange = () => {}, 
  onNotesChange = () => {} 
}: ControlCardProps) {
  const [status, setStatus] = useState<string>(control.status || "")
  const [notes, setNotes] = useState<string>(control.notes || "")

  const handleStatusChange = (value: string) => {
    setStatus(value)
    onStatusChange(control.id, value)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
    onNotesChange(control.id, e.target.value)
  }

  const getPriorityBadge = (priority: string) => {
    const priorities: Record<string, { color: string, label: string }> = {
      "P0": { color: "bg-red-100 text-red-800", label: "Critical" },
      "P1": { color: "bg-orange-100 text-orange-800", label: "High" },
      "P2": { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
      "P3": { color: "bg-blue-100 text-blue-800", label: "Low" }
    }

    const priorityInfo = priorities[priority] || { color: "bg-gray-100 text-gray-800", label: priority }
    
    return (
      <Badge variant="outline" className={`${priorityInfo.color} border-none`}>
        {priorityInfo.label}
      </Badge>
    )
  }

  return (
    <Card className="w-full shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">
            <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded mr-2">
              {control.id}
            </span>
            {control.title}
          </CardTitle>
          <div className="flex gap-2">
            {getPriorityBadge(control.priority)}
            {control.baseline.map(baseline => (
              <Badge key={baseline} variant="secondary">
                {baseline}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-4">{control.description}</p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm">Control Details</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm">
                {control.mitigationSuggestions.length > 0 && (
                  <div>
                    <h4 className="font-medium">Mitigation Suggestions:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {control.mitigationSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {control.assessmentProcedures.length > 0 && (
                  <div>
                    <h4 className="font-medium">Assessment Procedures:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {control.assessmentProcedures.map((procedure, index) => (
                        <li key={index}>{procedure}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {control.requiredArtifacts.length > 0 && (
                  <div>
                    <h4 className="font-medium">Required Artifacts:</h4>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {control.requiredArtifacts.map((artifact, index) => (
                        <li key={index}>{artifact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {control.related.length > 0 && (
                  <div>
                    <h4 className="font-medium">Related Controls:</h4>
                    <div className="flex flex-wrap gap-1">
                      {control.related.map((relatedId) => (
                        <Badge key={relatedId} variant="outline" className="font-mono">
                          {relatedId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start pt-4 pb-4 border-t">
        <div className="w-full mb-4">
          <RadioGroup
            value={status}
            onValueChange={handleStatusChange}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="implemented" id={`${control.id}-implemented`} />
              <Label 
                htmlFor={`${control.id}-implemented`}
                className="font-medium text-green-600"
              >
                Implemented
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partially" id={`${control.id}-partially`} />
              <Label 
                htmlFor={`${control.id}-partially`}
                className="font-medium text-amber-600"
              >
                Partially Implemented
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-implemented" id={`${control.id}-not-implemented`} />
              <Label 
                htmlFor={`${control.id}-not-implemented`}
                className="font-medium text-red-600"
              >
                Not Implemented
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not-applicable" id={`${control.id}-not-applicable`} />
              <Label 
                htmlFor={`${control.id}-not-applicable`}
                className="font-medium text-gray-500"
              >
                Not Applicable
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="w-full">
          <Label htmlFor={`${control.id}-notes`} className="mb-2 block text-sm">
            Assessment Notes
          </Label>
          <Textarea
            id={`${control.id}-notes`}
            placeholder="Add your assessment notes here..."
            className="min-h-[80px]"
            value={notes}
            onChange={handleNotesChange}
          />
        </div>
      </CardFooter>
    </Card>
  )
} 