export interface Control {
    id: string;
    family: string;
    title: string;
    description: string;
    priority: string;
    baseline: string[];
    related: string[];
    importance: string;
    mitigationSuggestions: string[];
    assessmentProcedures: string[];
    requiredArtifacts: string[];
    commentary?: string;
    status?: string;
    notes?: string;
    evidence?: string;
    score?: number;
  }
  
  export interface ControlFamily {
    [controlId: string]: Control;
  }
  
  export interface Controls {
    [family: string]: ControlFamily;
  }
  
  // Function to load all controls from the API
  export async function loadAllControls(): Promise<Controls> {
    try {
      // In a browser environment, fetch from API
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/controls');
          
          if (!response.ok) {
            console.error(`Error fetching controls: ${response.status} ${response.statusText}`);
            throw new Error(`Error fetching controls: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          return data;
        } catch (fetchError) {
          console.error('API fetch error:', fetchError);
          // Return empty controls on fetch error so the UI can still render
          return {};
        }
      } 
      // For server-side rendering or testing, we can implement a fallback
      else {
        console.warn('Server-side control loading not implemented');
        return {};
      }
    } catch (error) {
      console.error('Error loading controls:', error);
      return {};
    }
  }
  
  // Get all control families
  export function getControlFamilies(controls: Controls): string[] {
    return Object.keys(controls);
  }
  
  // Get controls for a specific family
  export function getControlsByFamily(controls: Controls, family: string): Control[] {
    if (!controls[family]) return [];
    
    return Object.values(controls[family]);
  }
  
  // Get a specific control by ID
  export function getControlById(controls: Controls, controlId: string): Control | null {
    const family = controlId.split('-')[0];
    if (!controls[family] || !controls[family][controlId]) return null;
    
    return controls[family][controlId];
  }
  
  // Filter controls by baseline
  export function filterControlsByBaseline(controls: Controls, baseline: string): Controls {
    const filteredControls: Controls = {};
    
    Object.keys(controls).forEach(family => {
      const familyControls = controls[family];
      const filteredFamilyControls: ControlFamily = {};
      
      Object.keys(familyControls).forEach(controlId => {
        const control = familyControls[controlId];
        if (control.baseline.includes(baseline)) {
          filteredFamilyControls[controlId] = control;
        }
      });
      
      if (Object.keys(filteredFamilyControls).length > 0) {
        filteredControls[family] = filteredFamilyControls;
      }
    });
    
    return filteredControls;
  }
  
  // Get all control IDs
  export function getAllControlIds(controls: Controls): string[] {
    const ids: string[] = [];
    
    Object.keys(controls).forEach(family => {
      const familyControls = controls[family];
      ids.push(...Object.keys(familyControls));
    });
    
    return ids.sort();
  }
  
  // Return control family name based on abbreviation
  export function getFamilyFullName(family: string): string {
    const familyNames: Record<string, string> = {
      'AC': 'Access Control',
      'AT': 'Awareness and Training',
      'AU': 'Audit and Accountability',
      'CA': 'Assessment, Authorization, and Monitoring',
      'CM': 'Configuration Management',
      'CP': 'Contingency Planning',
      'IA': 'Identification and Authentication',
      'IR': 'Incident Response',
      'MA': 'Maintenance',
      'MP': 'Media Protection',
      'PE': 'Physical and Environmental Protection',
      'PL': 'Planning',
      'PM': 'Program Management',
      'PS': 'Personnel Security',
      'PT': 'PII Processing and Transparency',
      'RA': 'Risk Assessment',
      'SA': 'System and Services Acquisition',
      'SC': 'System and Communications Protection',
      'SI': 'System and Information Integrity',
      'SR': 'Supply Chain Risk Management'
    };
    
    return familyNames[family] || family;
  } 