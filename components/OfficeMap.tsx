'use client'

import { useState, useRef, useEffect } from 'react'
import { formatDate } from '@/lib/utils'

interface Desk {
  id: string
  x: number
  y: number
  width: number
  height: number
  desk_number: string
  status: 'available' | 'reserved' | 'permanently_occupied'
}

interface OfficeMapProps {
  desks: Desk[]
  backgroundImage?: string
  selectedDate: Date
  onDeskClick?: (desk: Desk) => void
  isAdmin?: boolean
  onDeskUpdate?: (desk: Desk) => void
  onDeskDelete?: (deskId: string) => void
  reservations?: any[]
}

type ResizeHandle = 'ne' | 'se' | 'sw' | 'nw' | 'n' | 's' | 'e' | 'w' | null

export default function OfficeMap({
  desks,
  backgroundImage,
  selectedDate,
  onDeskClick,
  isAdmin = false,
  onDeskUpdate,
  onDeskDelete,
  reservations = [],
}: OfficeMapProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null)
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [initialResize, setInitialResize] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  // Fixed map dimensions (no scaling - use scrolling instead)
  const MAP_WIDTH = 1200
  const MAP_HEIGHT = 800

  const getDeskStatus = (desk: Desk) => {
    if (desk.status === 'permanently_occupied') return 'gray'

    const dateString = formatDate(selectedDate)
    const isReserved = reservations.some(
      (r) => r.desk_id === desk.id && r.date === dateString
    )

    return isReserved ? 'red' : 'green'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-500 hover:bg-green-600 border-green-700'
      case 'red':
        return 'bg-red-500 hover:bg-red-600 border-red-700 cursor-not-allowed'
      case 'gray':
        return 'bg-gray-500 hover:bg-gray-600 border-gray-700 cursor-not-allowed'
      default:
        return 'bg-green-500 hover:bg-green-600 border-green-700'
    }
  }

  // Keyboard controls for moving desks
  useEffect(() => {
    if (!isAdmin || !selectedDesk) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedDesk) return
      
      const desk = desks.find((d) => d.id === selectedDesk)
      if (!desk || !onDeskUpdate) return

      const step = e.shiftKey ? 10 : 1 // Hold Shift for faster movement
      let newX = desk.x
      let newY = desk.y
      let newWidth = desk.width
      let newHeight = desk.height
      let updated = false

      switch (e.key) {
        case 'ArrowLeft':
          newX = Math.max(0, desk.x - step)
          updated = true
          break
        case 'ArrowRight':
          newX = Math.min(containerRef.current?.clientWidth || 1000 - desk.width, desk.x + step)
          updated = true
          break
        case 'ArrowUp':
          newY = Math.max(0, desk.y - step)
          updated = true
          break
        case 'ArrowDown':
          newY = Math.min(containerRef.current?.clientHeight || 600 - desk.height, desk.y + step)
          updated = true
          break
        case '+':
        case '=':
          // Increase size
          newWidth = Math.min(200, desk.width + 5)
          newHeight = Math.min(200, desk.height + 5)
          updated = true
          break
        case '-':
        case '_':
          // Decrease size
          newWidth = Math.max(40, desk.width - 5)
          newHeight = Math.max(40, desk.height - 5)
          updated = true
          break
        case 'Escape':
          setSelectedDesk(null)
          return
      }

      if (updated) {
        e.preventDefault()
        onDeskUpdate({ ...desk, x: newX, y: newY, width: newWidth, height: newHeight })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin, selectedDesk, desks, onDeskUpdate])

  const handleMouseDown = (e: React.MouseEvent, desk: Desk) => {
    if (!isAdmin) return
    e.preventDefault()
    e.stopPropagation()

    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()

    setIsDragging(true)
    setSelectedDesk(desk.id)
    setDragOffset({
      x: e.clientX - rect.left - desk.x,
      y: e.clientY - rect.top - desk.y,
    })
  }

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    desk: Desk,
    handle: ResizeHandle
  ) => {
    if (!isAdmin) return
    e.stopPropagation()

    setIsResizing(true)
    setResizeHandle(handle)
    setSelectedDesk(desk.id)
    setInitialResize({
      x: e.clientX,
      y: e.clientY,
      width: desk.width,
      height: desk.height,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()

    // Handle resizing
    if (isResizing && selectedDesk && resizeHandle) {
      const desk = desks.find((d) => d.id === selectedDesk)
      if (!desk || !onDeskUpdate) return

      const deltaX = e.clientX - initialResize.x
      const deltaY = e.clientY - initialResize.y

      let newWidth = desk.width
      let newHeight = desk.height
      let newX = desk.x
      let newY = desk.y

      switch (resizeHandle) {
        case 'se': // Southeast
          newWidth = Math.max(40, Math.min(200, initialResize.width + deltaX))
          newHeight = Math.max(40, Math.min(200, initialResize.height + deltaY))
          break
        case 'sw': // Southwest
          newWidth = Math.max(40, Math.min(200, initialResize.width - deltaX))
          newHeight = Math.max(40, Math.min(200, initialResize.height + deltaY))
          newX = desk.x + (desk.width - newWidth)
          break
        case 'ne': // Northeast
          newWidth = Math.max(40, Math.min(200, initialResize.width + deltaX))
          newHeight = Math.max(40, Math.min(200, initialResize.height - deltaY))
          newY = desk.y + (desk.height - newHeight)
          break
        case 'nw': // Northwest
          newWidth = Math.max(40, Math.min(200, initialResize.width - deltaX))
          newHeight = Math.max(40, Math.min(200, initialResize.height - deltaY))
          newX = desk.x + (desk.width - newWidth)
          newY = desk.y + (desk.height - newHeight)
          break
        case 'n': // North
          newHeight = Math.max(40, Math.min(200, initialResize.height - deltaY))
          newY = desk.y + (desk.height - newHeight)
          break
        case 's': // South
          newHeight = Math.max(40, Math.min(200, initialResize.height + deltaY))
          break
        case 'e': // East
          newWidth = Math.max(40, Math.min(200, initialResize.width + deltaX))
          break
        case 'w': // West
          newWidth = Math.max(40, Math.min(200, initialResize.width - deltaX))
          newX = desk.x + (desk.width - newWidth)
          break
      }

      onDeskUpdate({ ...desk, x: newX, y: newY, width: newWidth, height: newHeight })
      return
    }

    // Handle dragging
    if (isDragging && selectedDesk) {
      const desk = desks.find((d) => d.id === selectedDesk)
      if (!desk || !onDeskUpdate) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const x = Math.max(0, Math.min(mouseX - dragOffset.x, rect.width - desk.width))
      const y = Math.max(0, Math.min(mouseY - dragOffset.y, rect.height - desk.height))

      onDeskUpdate({ ...desk, x, y })
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
    }
    if (isResizing) {
      setIsResizing(false)
      setResizeHandle(null)
    }
  }

  const handleDeskClick = (desk: Desk) => {
    const status = getDeskStatus(desk)
    if (status === 'green' && onDeskClick && !isAdmin) {
      onDeskClick(desk)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 h-full">
      {/* Mobile Scroll Hint */}
      <div className="mb-2 sm:hidden bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700 text-center">
        👆 Scrollaj mapu u svim smjerovima da vidiš sve pozicije
      </div>
      
      <div
        ref={containerRef}
        className="relative w-full h-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] max-h-[90vh] border-2 border-gray-200 rounded-lg overflow-auto touch-auto"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: isAdmin ? 'default' : 'grab',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          if (!isAdmin && desks.length > 0) {
            const touch = e.touches[0]
            const innerDiv = e.currentTarget.querySelector('div')
            if (!innerDiv) return
            const rect = innerDiv.getBoundingClientRect()

            const x = touch.clientX - rect.left + e.currentTarget.scrollLeft
            const y = touch.clientY - rect.top + e.currentTarget.scrollTop
            
            const touchedDesk = desks.find((desk) => {
              return (
                x >= desk.x &&
                x <= desk.x + desk.width &&
                y >= desk.y &&
                y <= desk.y + desk.height
              )
            })

            if (touchedDesk) {
              setSelectedDesk(touchedDesk.id)
            }
          }
        }}
        onTouchEnd={() => {
          if (!isAdmin && selectedDesk) {
            const desk = desks.find((d) => d.id === selectedDesk)
            if (desk) {
              handleDeskClick(desk)
            }
          }
        }}
      >
        {/* Inner container with fixed dimensions for scrolling */}
        <div
          className="relative"
          style={{
            width: `${MAP_WIDTH}px`,
            height: `${MAP_HEIGHT}px`,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: backgroundImage ? '#f9fafb' : '#f9fafb',
            minWidth: `${MAP_WIDTH}px`,
            minHeight: `${MAP_HEIGHT}px`,
          }}
        >
        {desks.map((desk) => {
          const status = getDeskStatus(desk)
          const isSelected = selectedDesk === desk.id
          
          return (
            <div
              key={desk.id}
              className={`absolute rounded-lg border-2 flex items-center justify-center font-bold text-white transition-all ${getStatusColor(
                status
              )} ${isSelected ? 'shadow-2xl ring-4 ring-blue-400 z-50' : 'shadow-md'} ${
                isAdmin ? 'cursor-move' : 'cursor-pointer'
              }`}
              style={{
                left: `${desk.x}px`,
                top: `${desk.y}px`,
                width: `${desk.width}px`,
                height: `${desk.height}px`,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                fontSize: `${Math.max(12, desk.width / 6)}px`,
              }}
              onMouseDown={(e) => {
                if (isAdmin) {
                  handleMouseDown(e, desk)
                } else {
                  setSelectedDesk(desk.id)
                }
              }}
              onClick={(e) => {
                if (!isAdmin && !isDragging && !isResizing) {
                  handleDeskClick(desk)
                }
              }}
            >
              <div className="text-center pointer-events-none" style={{ fontSize: `${Math.max(12, desk.width / 5)}px` }}>
                <div>{desk.desk_number}</div>
                {isAdmin && isSelected && (
                  <div className="mt-1 opacity-75" style={{ fontSize: `${Math.max(10, desk.width / 8)}px` }}>
                    {desk.width}x{desk.height}
                  </div>
                )}
              </div>

              {/* Delete Button */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeskDelete && onDeskDelete(desk.id)
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 text-xs z-10"
                >
                  ×
                </button>
              )}

              {/* Resize Handles (visible only when selected in admin mode) */}
              {isAdmin && isSelected && (
                <>
                  {/* Corner Handles */}
                  <div
                    className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize z-10"
                    onMouseDown={(e) => handleResizeMouseDown(e, desk, 'nw')}
                  />
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize z-10"
                    onMouseDown={(e) => handleResizeMouseDown(e, desk, 'ne')}
                  />
                  <div
                    className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize z-10"
                    onMouseDown={(e) => handleResizeMouseDown(e, desk, 'sw')}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize z-10"
                    onMouseDown={(e) => handleResizeMouseDown(e, desk, 'se')}
                  />

                  {/* Edge Handles */}
                  <div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-n-resize z-10"
                    onMouseDown={(e) => handleResizeMouseDown(e, desk, 'n')}
                  />
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full cursor-s-resize z-10"
                    onMouseDown={(e) => handleResizeMouseDown(e, desk, 's')}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-w-resize z-10"
                    onMouseDown={(e) => handleResizeMouseDown(e, desk, 'w')}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-e-resize z-10"
                    onMouseDown={(e) => handleResizeMouseDown(e, desk, 'e')}
                  />
                </>
              )}
            </div>
          )
        })}

          {desks.length === 0 && !isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-lg">
                Admin još nije kreirao mjesta za rezervaciju
              </p>
            </div>
          )}

          {desks.length === 0 && isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-lg">
                Kliknite "Dodaj stol" za kreiranje mjesta
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-3">
        <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded border-2 border-green-700"></div>
            <span>Slobodno</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded border-2 border-red-700"></div>
            <span>Rezervirano</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-500 rounded border-2 border-gray-700"></div>
            <span>Trajno zauzeto</span>
          </div>
        </div>

        {isAdmin && (
          <div className="hidden sm:block bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
            <div className="font-semibold text-blue-800 mb-2">⌨️ Keyboard Kontrole:</div>
            <div className="grid grid-cols-2 gap-2 text-blue-700">
              <div><kbd className="px-1 py-0.5 bg-white rounded border">←↑↓→</kbd> Micanje</div>
              <div><kbd className="px-1 py-0.5 bg-white rounded border">Shift + ←↑↓→</kbd> Brže micanje</div>
              <div><kbd className="px-1 py-0.5 bg-white rounded border">+</kbd> Povećaj</div>
              <div><kbd className="px-1 py-0.5 bg-white rounded border">-</kbd> Smanji</div>
              <div><kbd className="px-1 py-0.5 bg-white rounded border">Esc</kbd> Deselect</div>
              <div>🖱️ Drag handles za resize</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

