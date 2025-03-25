import React, { useEffect, useRef } from 'react';

interface DonutChartProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

const DonutChart: React.FC<DonutChartProps> = ({
  value,
  size = 160,
  strokeWidth = 12,
  primaryColor = '#4f46e5',
  backgroundColor = '#e5e7eb',
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size with higher resolution for retina displays
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    // Scale the drawing context
    ctx.scale(scale, scale);
    
    // Calculate the actual progress (0-100)
    const progress = Math.min(Math.max(value, 0), 100) / 100;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size - strokeWidth) / 2;
    
    // Clear the canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = backgroundColor;
    ctx.stroke();
    
    // Draw progress arc
    if (progress > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -0.5 * Math.PI, (-0.5 + 2 * progress) * Math.PI, false);
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = primaryColor;
      ctx.stroke();
    }
  }, [value, size, strokeWidth, primaryColor, backgroundColor]);
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <canvas ref={canvasRef} width={size} height={size} />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default DonutChart; 