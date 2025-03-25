import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { Controls, ControlFamily, Control } from '@/lib/utils/controlUtils'

export async function GET() {
  try {
    const controlsDir = path.join(process.cwd(), 'controls')
    const files = fs.readdirSync(controlsDir)
    
    const controls: Controls = {}
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(controlsDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const fileData = JSON.parse(fileContent)
        
        // Extract the control type from the filename (e.g., 'ac-controls.json' -> 'ac')
        const controlType = file.replace('-controls.json', '')
        
        // If the file contains directly nested data structure, use it directly
        if (fileData[controlType.toUpperCase()]) {
          controls[controlType] = fileData[controlType.toUpperCase()]
        } 
        // If file contains an array of controls, convert to object structure
        else if (Array.isArray(fileData)) {
          const controlFamily: ControlFamily = {}
          fileData.forEach((control: Control) => {
            controlFamily[control.id] = control
          })
          controls[controlType] = controlFamily
        }
        // If the file structure doesn't match either case, log an error
        else {
          console.error(`Invalid control data format in ${file}`)
        }
      }
    }
    
    return NextResponse.json(controls)
  } catch (error) {
    console.error('Error loading controls:', error)
    return NextResponse.json({ error: 'Failed to load controls' }, { status: 500 })
  }
} 