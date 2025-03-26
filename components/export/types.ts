// Export component type definitions

export interface AssessmentControl {
  status: string;
  notes: string;
  score: number;
}

export interface AssessmentControlFamily {
  [controlId: string]: AssessmentControl;
}

export interface AssessmentData {
  id: string;
  name: string;
  organization: string;
  assessor: string;
  scope?: string;
  date: string;
  status: string;
  completion: number;
  score: number;
  controls: {
    [family: string]: AssessmentControlFamily;
  };
}

export interface AssessmentResult {
  assessment: AssessmentData;
}

export interface ControlStats {
  total: number;
  implemented: number;
  partiallyImplemented: number;
  planned: number;
  notImplemented: number;
  notApplicable: number;
} 