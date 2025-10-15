"use client"

import * as React from "react"
import { Button } from "./button"
import { Slider } from "./slider"
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react"

interface ImageCropperProps {
  src: string
  onCrop: (croppedFile: File) => void
  onCancel: () => void
  aspectRatio?: number
}

export function ImageCropper({ 
  src, 
  onCrop, 
  onCancel, 
  aspectRatio = 1 
}: ImageCropperProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const imageRef = React.useRef<HTMLImageElement>(null)
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })

  const cropSize = 200 // Fixed crop size for profile photos

  React.useEffect(() => {
    drawCanvas()
  }, [scale, rotation, position, src])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = cropSize
    canvas.height = cropSize

    // Clear canvas
    ctx.clearRect(0, 0, cropSize, cropSize)

    // Save context
    ctx.save()

    // Move to center
    ctx.translate(cropSize / 2, cropSize / 2)

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180)

    // Apply scale and position
    ctx.scale(scale, scale)
    ctx.translate(position.x, position.y)

    // Draw image centered
    const imageWidth = image.naturalWidth
    const imageHeight = image.naturalHeight
    ctx.drawImage(
      image,
      -imageWidth / 2,
      -imageHeight / 2,
      imageWidth,
      imageHeight
    )

    // Restore context
    ctx.restore()

    // Draw crop overlay
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(0, 0, cropSize, cropSize)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setPosition(prev => ({
      x: prev.x + deltaX / scale,
      y: prev.y + deltaY / scale
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCrop = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return

      // Create file from blob
      const file = new File([blob], 'profile-photo.png', { type: 'image/png' })
      onCrop(file)
    }, 'image/png', 0.9)
  }

  const resetTransform = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div className="space-y-4">
      {/* Hidden image for loading */}
      <img
        ref={imageRef}
        src={src}
        alt="Crop preview"
        className="hidden"
        onLoad={drawCanvas}
      />

      {/* Crop canvas */}
      <div className="flex justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-2 border-neutral-300 rounded-lg cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border-2 border-white border-dashed rounded-lg" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Scale control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Zoom</label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScale(Math.min(3, scale + 0.1))}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Slider
            value={[scale]}
            onValueChange={([value]) => setScale(value)}
            min={0.5}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Rotation control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rotation</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRotation((rotation + 90) % 360)}
            >
              <RotateCw className="h-3 w-3" />
            </Button>
          </div>
          <Slider
            value={[rotation]}
            onValueChange={([value]) => setRotation(value)}
            min={0}
            max={360}
            step={1}
            className="w-full"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={resetTransform}
          >
            Reset
          </Button>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCrop}
            >
              Apply Crop
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Drag to reposition • Use controls to zoom and rotate
      </p>
    </div>
  )
}