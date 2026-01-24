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

    // Background - Deep Roast (Dark Navy/Black)
    ctx.fillStyle = '#1a1f2e' // Darker version of oklch(0.12 0.02 40)
    ctx.fillRect(0, 0, width, height)

    // Add subtle gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#1a1f2e')
    gradient.addColorStop(1, '#151925')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Header pill
    const headerY = 60
    const pillWidth = 500
    const pillHeight = 80
    const pillX = (width - pillWidth) / 2

    // Neon glow for header
    ctx.shadowColor = 'rgba(168, 85, 247, 0.3)' // Purple glow
    ctx.shadowBlur = 20
    ctx.fillStyle = '#2d2420' // Dark espresso
    ctx.beginPath()
    ctx.roundRect(pillX, headerY, pillWidth, pillHeight, 40)
    ctx.fill()
    ctx.shadowBlur = 0 // Reset shadow

    // Header text
    ctx.fillStyle = '#f5f5f5'
    ctx.font = '32px "Playfair Display", serif'
    ctx.textAlign = 'center'
    ctx.fillText('BREW JOURNAL', width / 2, headerY + 50)

    // Recipe name and total time
    ctx.fillStyle = '#a855f7' // Primary accent (purple/blue-ish)
    ctx.font = 'bold 36px "Playfair Display", serif'
    ctx.textAlign = 'center'
    ctx.fillText(recipe.name, width / 2, 220)

    ctx.fillStyle = '#9ca3af' // Muted text
    ctx.font = '24px sans-serif'
    ctx.fillText(`Total Time: ${getTotalTime()}`, width / 2, 260)

    // Method and ratio on the right
    ctx.textAlign = 'right'
    ctx.fillStyle = '#d97706' // Amber accent
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText(recipe.method.toUpperCase(), width - 100, 290)

    ctx.fillStyle = '#f5f5f5'
    ctx.font = 'bold 40px "Playfair Display", serif'
    ctx.fillText(getBrewRatio(), width - 100, 340)

    // Timeline
    let yOffset = 380
    const lineX = 150

    const pours = recipe.pours || []
    pours.forEach((pour, index) => {
      // Timeline dot
      ctx.fillStyle = pour.isBloom ? '#d97706' : '#2d2420' // Amber for bloom, Espresso for pours
      ctx.beginPath()
      ctx.arc(lineX, yOffset, 10, 0, Math.PI * 2)
      ctx.fill()

      // Add glow to dot
      if (pour.isBloom) {
        ctx.shadowColor = 'rgba(217, 119, 6, 0.5)'
        ctx.shadowBlur = 15
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Vertical line (except for last item)
      if (index < pours.length - 1) {
        ctx.strokeStyle = '#374151' // Dark gray border color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(lineX, yOffset + 10)
        ctx.lineTo(lineX, yOffset + 120)
        ctx.stroke()
      }

      // Time range
      const startTime = pour.time
      const endTime = index < pours.length - 1
        ? pours[index + 1].time
        : pour.time

      ctx.fillStyle = '#e5e7eb' // Light gray text
      ctx.font = '20px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(
        `${startTime}`,
        30,
        yOffset + 6
      )

      // Pour details
      ctx.fillStyle = '#f5f5f5'
      ctx.font = 'bold 28px sans-serif'
      const runningTotal = pours
        .slice(0, index + 1)
        .reduce((sum, p) => sum + p.waterAmount, 0)
      const percentage = Math.round((runningTotal / recipe.totalWaterWeight) * 100)

      ctx.fillText(
        `Pour ${index + 1} • ${pour.waterAmount}g`,
        lineX + 40,
        yOffset + 6
      )

      if (index > 0) {
        ctx.font = '24px sans-serif'
        ctx.fillStyle = '#6b7280' // Muted
        ctx.fillText(`(+${pour.waterAmount}g)`, lineX + 340, yOffset + 6)
      }

      // Percentage on right
      ctx.fillStyle = '#a855f7' // Purple accent
      ctx.font = 'bold 32px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`${percentage}%`, width - 100, yOffset + 6)

      // Notes
      if (pour.notes) {
        ctx.fillStyle = '#9ca3af'
        ctx.font = 'italic 20px sans-serif'
        ctx.textAlign = 'left'
        const noteText = pour.notes.length > 50
          ? pour.notes.substring(0, 50) + '...'
          : pour.notes

        // Bloom tag style
        if (pour.isBloom) {
          ctx.fillStyle = 'rgba(217, 119, 6, 0.2)'
          ctx.fillRect(lineX + 40, yOffset + 20, 80, 30)
          ctx.fillStyle = '#d97706'
          ctx.fillText('BLOOM', lineX + 50, yOffset + 42)
        } else {
          ctx.fillText(noteText, lineX + 40, yOffset + 40)
        }
      }

      yOffset += 120
    })

    // Footer
    ctx.fillStyle = '#374151'
    ctx.textAlign = 'center'
    ctx.font = '16px sans-serif'
    ctx.fillText('Generated with Brew Journal', width / 2, height - 30)

    // Download the image safely
    const link = document.createElement('a')
    link.download = `${recipe.name.replace(/\s+/g, '-').toLowerCase()}-recipe.png`
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
