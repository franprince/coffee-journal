'use client'

import { Recipe } from '@/lib/types'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRef } from 'react'

interface RecipeExportProps {
  recipe: Recipe
}

export function RecipeExport({ recipe }: RecipeExportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const parseTime = (timeStr: string): number => {
    const [mins, secs] = timeStr.split(':').map(Number)
    return (mins || 0) * 60 + (secs || 0)
  }

  const formatTime = (timeStr: string) => {
    return timeStr
  }

  const getTotalTime = () => {
    if (!recipe.pours || recipe.pours.length === 0) return '0:00'
    const lastPour = recipe.pours[recipe.pours.length - 1]
    return lastPour.time
  }

  const getBrewRatio = () => {
    const ratio = recipe.totalWaterWeight / recipe.coffeeWeight
    return `1:${ratio.toFixed(1)}`
  }

  const exportImage = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const width = 800
    const height = 600 + ((recipe.pours?.length || 0) * 120)
    canvas.width = width
    canvas.height = height

    // Background - neutral beige/gray
    ctx.fillStyle = '#c4bdb5'
    ctx.fillRect(0, 0, width, height)

    // Header pill
    const headerY = 60
    const pillWidth = 500
    const pillHeight = 80
    const pillX = (width - pillWidth) / 2
    
    ctx.fillStyle = '#4a4641'
    ctx.beginPath()
    ctx.roundRect(pillX, headerY, pillWidth, pillHeight, 40)
    ctx.fill()

    // Header text
    ctx.fillStyle = '#f5f5f5'
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('COFFEE RECIPE', width / 2, headerY + 50)

    // Recipe name and total time
    ctx.fillStyle = '#3a3531'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(recipe.name, width / 2, 200)

    ctx.font = '24px sans-serif'
    ctx.fillText(`Total Time: ${getTotalTime()}`, width / 2, 240)

    // Method and ratio on the right
    ctx.textAlign = 'right'
    ctx.font = '22px sans-serif'
    ctx.fillText(recipe.method, width - 100, 290)
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(getBrewRatio(), width - 100, 330)

    // Timeline
    let yOffset = 360
    const lineX = 150

    const pours = recipe.pours || []
    pours.forEach((pour, index) => {
      const isBloom = pour.notes?.toLowerCase().includes('bloom')
      
      // Timeline dot
      ctx.fillStyle = '#4a4641'
      ctx.beginPath()
      ctx.arc(lineX, yOffset, 8, 0, Math.PI * 2)
      ctx.fill()

      // Vertical line (except for last item)
      if (index < pours.length - 1) {
        ctx.strokeStyle = '#4a4641'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(lineX, yOffset + 8)
        ctx.lineTo(lineX, yOffset + 120)
        ctx.stroke()
      }

      // Time range
      const startTime = pour.time
      const endTime = index < pours.length - 1 
        ? pours[index + 1].time 
        : pour.time
      
      ctx.fillStyle = '#3a3531'
      ctx.font = '20px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(
        `${startTime}-${endTime} •`,
        20,
        yOffset + 6
      )

      // Pour details
      ctx.font = 'bold 28px sans-serif'
      const runningTotal = pours
        .slice(0, index + 1)
        .reduce((sum, p) => sum + p.waterAmount, 0)
      const percentage = Math.round((runningTotal / recipe.totalWaterWeight) * 100)
      
      ctx.fillText(
        `Pour ${index + 1}  ${pour.waterAmount}mL`,
        lineX + 30,
        yOffset + 6
      )

      if (index > 0) {
        ctx.font = '24px sans-serif'
        ctx.fillStyle = '#5a5551'
        ctx.fillText(`(+${pour.waterAmount}mL)`, lineX + 320, yOffset + 6)
      }

      // Percentage on right
      ctx.fillStyle = '#3a3531'
      ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`${percentage}%`, width - 100, yOffset + 6)

      // Notes
      if (pour.notes) {
        ctx.fillStyle = '#5a5551'
        ctx.font = '18px sans-serif'
        ctx.textAlign = 'left'
        const noteText = pour.notes.length > 50 
          ? pour.notes.substring(0, 50) + '...' 
          : pour.notes
        ctx.fillText(noteText, lineX + 30, yOffset + 40)
      }

      // Temperature if available
      if (pour.temperature) {
        ctx.fillStyle = '#5a5551'
        ctx.font = '16px sans-serif'
        ctx.fillText(`${pour.temperature}°C`, lineX + 30, yOffset + 65)
      }

      yOffset += 120
    })

    // Download the image
    const link = document.createElement('a')
    link.download = `${recipe.name.replace(/\s+/g, '-').toLowerCase()}-recipe.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div>
      <Button 
        onClick={exportImage}
        variant="outline"
        size="sm"
        className="gap-2 bg-card hover:bg-secondary border-border text-coffee-espresso"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
