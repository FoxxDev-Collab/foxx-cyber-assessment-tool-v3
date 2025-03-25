import type { Controls, Control } from '@/lib/utils/controlUtils'

export async function loadAllControls(): Promise<Controls> {
  try {
    const response = await fetch('/api/controls', { next: { revalidate: 3600 } })
    
    if (!response.ok) {
      console.error(`Error fetching controls: ${response.status} ${response.statusText}`)
      throw new Error(`Error fetching controls: ${response.statusText}`)
    }
    
    const controls = await response.json()
    return controls
  } catch (error) {
    console.error('Error loading controls:', error)
    return {}
  }
}

export async function getControlById(controlType: string, controlId: string): Promise<Control | null> {
  const controls = await loadAllControls()
  const typeControls = controls[controlType]
  
  if (!typeControls) {
    return null
  }
  
  return typeControls[controlId] || null
} 