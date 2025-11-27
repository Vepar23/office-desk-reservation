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
  exemptions?: any[]
  onExemptDesk?: (desk: Desk) => void
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
  exemptions = [],
  onExemptDesk,
}: OfficeMapProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null)
  const [selectedDesk, setSelectedDesk] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [initialResize, setInitialResize] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Zoom functionality - default 50% on mobile, 100% on desktop
  const [zoom, setZoom] = useState(1)
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null)
  const [touchStartTime, setTouchStartTime] = useState<number>(0)
  const [touchMoved, setTouchMoved] = useState(false)
  const [hoveredDesk, setHoveredDesk] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Fixed map dimensions (no scaling - use scrolling instead)
  // Desktop: large map size, Mobile: scrollable + zoomable
  const MAP_WIDTH = 1600
  const MAP_HEIGHT = 1000

  // Zoom functions
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3)) // Max zoom 3x
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5)) // Min zoom 0.5x
  }

  const handleZoomReset = () => {
    setZoom(isMobile ? 0.5 : 1) // Reset to 50% on mobile, 100% on desktop
  }

  // Initialize mobile detection and set default zoom
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640 // sm breakpoint
      setIsMobile(mobile)
      // Set initial zoom: 50% on mobile, 100% on desktop
      setZoom(mobile ? 0.5 : 1)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Center the map on initial load
  useEffect(() => {
    if (containerRef.current && backgroundImage) {
      const container = containerRef.current
      const scrollX = (MAP_WIDTH * zoom - container.clientWidth) / 2
      const scrollY = (MAP_HEIGHT * zoom - container.clientHeight) / 2
      
      container.scrollTo({
        left: Math.max(0, scrollX),
        top: Math.max(0, scrollY),
        behavior: 'smooth'
      })
    }
  }, [backgroundImage, zoom])

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null
    const touch1 = touches[0]
    const touch2 = touches[1]
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getDeskStatus = (desk: Desk) => {
    const dateString = formatDate(selectedDate)
    
    // Check if permanently occupied desk is exempted for this date
    if (desk.status === 'permanently_occupied') {
      const isExempted = exemptions.some(
        (e) => e.desk_id === desk.id && e.date === dateString
      )
      // If exempted, treat as available
      if (!isExempted) return 'gray'
    }

    const isReserved = reservations.some(
      (r) => r.desk_id === desk.id && r.date === dateString
    )

    return isReserved ? 'red' : 'green'
  }

  const getReservationForDesk = (desk: Desk) => {
    const dateString = formatDate(selectedDate)
    const reservation = reservations.find(
      (r) => r.desk_id === desk.id && r.date === dateString
    )
    if (reservation) {
      console.log('Reservation found:', reservation)
    }
    return reservation
  }

  const getStatusColor = (status: string, isPermanentlyOccupied: boolean) => {
    switch (status) {
      case 'green':
        return 'bg-green-500 hover:bg-green-600 border-green-700'
      case 'red':
        return 'bg-red-500 hover:bg-red-600 border-red-700 cursor-not-allowed'
      case 'gray':
        // Gray desks are clickable (to allow exemption) unless in admin mode
        return isAdmin 
          ? 'bg-gray-500 hover:bg-gray-600 border-gray-700'
          : 'bg-gray-500 hover:bg-gray-600 border-gray-700 cursor-pointer'
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
          newX = Math.min(MAP_WIDTH - desk.width, desk.x + step)
          updated = true
          break
        case 'ArrowUp':
          newY = Math.max(0, desk.y - step)
          updated = true
          break
        case 'ArrowDown':
          newY = Math.min(MAP_HEIGHT - desk.height, desk.y + step)
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
    const scrollLeft = containerRef.current.scrollLeft
    const scrollTop = containerRef.current.scrollTop

    setIsDragging(true)
    setSelectedDesk(desk.id)
    setDragOffset({
      x: e.clientX - rect.left + scrollLeft - desk.x,
      y: e.clientY - rect.top + scrollTop - desk.y,
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
          newWidth = Math.max(40, Math.min(200, Math.min(MAP_WIDTH - desk.x, initialResize.width + deltaX)))
          newHeight = Math.max(40, Math.min(200, Math.min(MAP_HEIGHT - desk.y, initialResize.height + deltaY)))
          break
        case 'sw': // Southwest
          newWidth = Math.max(40, Math.min(200, initialResize.width - deltaX))
          newHeight = Math.max(40, Math.min(200, Math.min(MAP_HEIGHT - desk.y, initialResize.height + deltaY)))
          newX = Math.max(0, desk.x + (desk.width - newWidth))
          break
        case 'ne': // Northeast
          newWidth = Math.max(40, Math.min(200, Math.min(MAP_WIDTH - desk.x, initialResize.width + deltaX)))
          newHeight = Math.max(40, Math.min(200, initialResize.height - deltaY))
          newY = Math.max(0, desk.y + (desk.height - newHeight))
          break
        case 'nw': // Northwest
          newWidth = Math.max(40, Math.min(200, initialResize.width - deltaX))
          newHeight = Math.max(40, Math.min(200, initialResize.height - deltaY))
          newX = Math.max(0, desk.x + (desk.width - newWidth))
          newY = Math.max(0, desk.y + (desk.height - newHeight))
          break
        case 'n': // North
          newHeight = Math.max(40, Math.min(200, initialResize.height - deltaY))
          newY = Math.max(0, desk.y + (desk.height - newHeight))
          break
        case 's': // South
          newHeight = Math.max(40, Math.min(200, Math.min(MAP_HEIGHT - desk.y, initialResize.height + deltaY)))
          break
        case 'e': // East
          newWidth = Math.max(40, Math.min(200, Math.min(MAP_WIDTH - desk.x, initialResize.width + deltaX)))
          break
        case 'w': // West
          newWidth = Math.max(40, Math.min(200, initialResize.width - deltaX))
          newX = Math.max(0, desk.x + (desk.width - newWidth))
          break
      }

      onDeskUpdate({ ...desk, x: newX, y: newY, width: newWidth, height: newHeight })
      return
    }

    // Handle dragging
    if (isDragging && selectedDesk) {
      const desk = desks.find((d) => d.id === selectedDesk)
      if (!desk || !onDeskUpdate) return

      const scrollLeft = containerRef.current.scrollLeft
      const scrollTop = containerRef.current.scrollTop

      const mouseX = e.clientX - rect.left + scrollLeft
      const mouseY = e.clientY - rect.top + scrollTop

      const x = Math.max(0, Math.min(mouseX - dragOffset.x, MAP_WIDTH - desk.width))
      const y = Math.max(0, Math.min(mouseY - dragOffset.y, MAP_HEIGHT - desk.height))

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
    if (isAdmin) return

    const status = getDeskStatus(desk)
    
    // Handle permanently occupied desks
    if (desk.status === 'permanently_occupied' && status === 'gray') {
      if (onExemptDesk) {
        onExemptDesk(desk)
      }
      return
    }

    // Handle available desks
    if (status === 'green' && onDeskClick) {
      onDeskClick(desk)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 sm:p-4 h-full transition-colors">
      {/* Mobile Instructions */}
      <div className="mb-2 sm:hidden bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700 text-center">
        👆 Tap na stol za rezervaciju • Pinch za zoom • Scrollaj za navigaciju
      </div>

      {/* Zoom Controls - visible on both mobile and desktop */}
      <div className="mb-2 flex items-center justify-center gap-2">
        <button
          onClick={handleZoomOut}
          className="bg-blue-600 text-white rounded-lg px-3 py-2 sm:px-4 sm:py-3 font-bold text-lg sm:text-xl hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[40px] sm:min-w-[48px]"
          disabled={zoom <= 0.5}
          title="Zoom Out"
        >
          −
        </button>
        <div className="bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 min-w-[60px] sm:min-w-[70px] text-center">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={handleZoomReset}
          className="bg-gray-600 text-white rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hover:bg-gray-700 active:bg-gray-800 transition whitespace-nowrap"
          title="Reset zoom"
        >
          ⟲
        </button>
        <button
          onClick={handleZoomIn}
          className="bg-blue-600 text-white rounded-lg px-3 py-2 sm:px-4 sm:py-3 font-bold text-lg sm:text-xl hover:bg-blue-700 active:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[40px] sm:min-w-[48px]"
          disabled={zoom >= 3}
          title="Zoom In"
        >
          +
        </button>
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
        onScroll={() => {
          // Hide tooltip when scrolling
          setHoveredDesk(null)
          setTooltipPosition(null)
        }}
        onTouchStart={(e) => {
          setTouchStartTime(Date.now())
          setTouchMoved(false)
          
          // Pinch zoom detection
          if (e.touches.length === 2) {
            const distance = getTouchDistance(e.touches)
            setLastTouchDistance(distance)
            return
          }

          if (!isAdmin && desks.length > 0 && e.touches.length === 1) {
            const touch = e.touches[0]
            const innerDiv = e.currentTarget.querySelector('div')
            if (!innerDiv) return
            const rect = innerDiv.getBoundingClientRect()

            const x = (touch.clientX - rect.left + e.currentTarget.scrollLeft) / zoom
            const y = (touch.clientY - rect.top + e.currentTarget.scrollTop) / zoom
            
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
            } else {
              setSelectedDesk(null)
            }
          }
        }}
        onTouchMove={(e) => {
          setTouchMoved(true)
          
          // Hide tooltip when moving/scrolling on mobile
          setHoveredDesk(null)
          setTooltipPosition(null)
          
          // Handle pinch zoom
          if (e.touches.length === 2 && lastTouchDistance !== null) {
            e.preventDefault()
            const currentDistance = getTouchDistance(e.touches)
            if (currentDistance) {
              const scale = currentDistance / lastTouchDistance
              setZoom((prev) => Math.max(0.5, Math.min(3, prev * scale)))
              setLastTouchDistance(currentDistance)
            }
          }
        }}
        onTouchEnd={(e) => {
          // Reset touch distance when pinch ends
          if (e.touches.length < 2) {
            setLastTouchDistance(null)
          }

          // Only trigger desk click if:
          // 1. Not admin
          // 2. A desk is selected
          // 3. No touches remaining
          // 4. Touch was quick (< 300ms) and minimal movement
          const touchDuration = Date.now() - touchStartTime
          
          if (
            !isAdmin && 
            selectedDesk && 
            e.touches.length === 0 &&
            !touchMoved &&
            touchDuration < 300
          ) {
            const desk = desks.find((d) => d.id === selectedDesk)
            if (desk) {
              handleDeskClick(desk)
            }
          }
          
          // Reset after some delay to prevent accidental clicks
          setTimeout(() => {
            if (!isAdmin) {
              setSelectedDesk(null)
            }
          }, 100)
        }}
      >
        {/* Wrapper for zoom transform */}
        <div
          style={{
            width: `${MAP_WIDTH * zoom}px`,
            height: `${MAP_HEIGHT * zoom}px`,
          }}
        >
          {/* Inner container with fixed dimensions for scrolling and zoom */}
          <div
            className="relative"
            style={{
              width: `${MAP_WIDTH}px`,
              height: `${MAP_HEIGHT}px`,
              // Zagreb city map as background layer
              backgroundImage: `url(/zagreb-map.png)`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            {/* Office floor plan layer with transparency */}
            {backgroundImage && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  opacity: 0.85, // Slight transparency to see city map behind
                  backgroundColor: 'rgba(249, 250, 251, 0.7)', // Semi-transparent white
                }}
              />
            )}
        {desks.map((desk) => {
          const status = getDeskStatus(desk)
          const isSelected = selectedDesk === desk.id
          const reservation = getReservationForDesk(desk)
          const isHovered = hoveredDesk === desk.id
          
          return (
            <div
              key={desk.id}
              className={`absolute rounded-lg border-2 flex items-center justify-center font-bold text-white transition-all ${getStatusColor(
                status, desk.status === 'permanently_occupied'
              )} ${isSelected ? 'shadow-2xl ring-4 ring-blue-400 z-50' : 'shadow-md'} ${
                isAdmin ? 'cursor-move' : (status === 'gray' || status === 'green' ? 'cursor-pointer' : 'cursor-not-allowed')
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
              onMouseEnter={(e) => {
                setHoveredDesk(desk.id)
                if (status === 'red' && reservation && containerRef.current) {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltipPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10
                  })
                }
              }}
              onMouseLeave={() => {
                setHoveredDesk(null)
                setTooltipPosition(null)
              }}
            >
              <div className="text-center pointer-events-none" style={{ fontSize: `${Math.max(12, desk.width / 5)}px` }}>
                <div>{desk.desk_number}</div>
              </div>

              {/* Tooltip with position and dimensions - positioned above the desk */}
              {isAdmin && isSelected && (
                <div 
                  className="absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-semibold whitespace-nowrap z-[100] pointer-events-none"
                  style={{
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>📍 ({Math.round(desk.x)}, {Math.round(desk.y)})</span>
                    <span className="text-gray-400">|</span>
                    <span>📐 {desk.width}×{desk.height}</span>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}

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
      </div>

      {/* Fixed position tooltip - rendered outside of transform context */}
      {hoveredDesk && tooltipPosition && (() => {
        const desk = desks.find((d) => d.id === hoveredDesk)
        if (!desk) return null
        const status = getDeskStatus(desk)
        const reservation = getReservationForDesk(desk)
        console.log('Tooltip check:', { status, reservation, username: reservation?.username })
        if (status !== 'red' || !reservation) return null
        
        return (
          <div 
            className="fixed bg-red-900 text-white px-3 py-2 rounded-lg shadow-2xl text-xs font-semibold whitespace-nowrap z-[9999] pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="text-center">
              <div className="text-xs opacity-75 mb-0.5">Rezervirao:</div>
              <div className="text-sm">{reservation.username || 'Nepoznato'}</div>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-red-900 rotate-45"></div>
          </div>
        )
      })()}

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

