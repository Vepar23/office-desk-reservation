'use client'

import { useState, useEffect, useRef } from 'react'
import { isWeekend, isSameDay } from '@/lib/utils'

interface CalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  reservedDates?: string[]
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  reservedDates = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLButtonElement>(null)

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const monthNames = [
    'Siječanj',
    'Veljača',
    'Ožujak',
    'Travanj',
    'Svibanj',
    'Lipanj',
    'Srpanj',
    'Kolovoz',
    'Rujan',
    'Listopad',
    'Studeni',
    'Prosinac',
  ]

  const dayNames = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub']

  // Auto-scroll to today's date
  useEffect(() => {
    if (todayRef.current && scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current
      const todayButton = todayRef.current
      
      // Calculate scroll position to center today's button
      const containerWidth = scrollContainer.offsetWidth
      const buttonLeft = todayButton.offsetLeft
      const buttonWidth = todayButton.offsetWidth
      
      const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)
      
      scrollContainer.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      })
    }
  }, [currentMonth])

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    )
  }

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    if (!isWeekend(date)) {
      onDateSelect(date)
    }
  }

  const isDateReserved = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    )
    const dateString = date.toISOString().split('T')[0]
    return reservedDates.includes(dateString)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 sm:p-2 hover:bg-blue-200 rounded-lg transition flex-shrink-0"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-base sm:text-xl font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-1 sm:p-2 hover:bg-blue-200 rounded-lg transition flex-shrink-0"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Horizontal scrollable calendar */}
      <div ref={scrollContainerRef} className="overflow-x-auto pb-2">
        <div className="flex gap-2 sm:gap-3 min-w-max">
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            )
            const isWeekendDay = isWeekend(date)
            const isSelected = isSameDay(date, selectedDate)
            const isReserved = isDateReserved(day)
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
            const dayName = dayNames[date.getDay()]
            const today = new Date()
            const isToday = date.getDate() === today.getDate() && 
                           date.getMonth() === today.getMonth() && 
                           date.getFullYear() === today.getFullYear()

            return (
              <button
                key={day}
                ref={isToday ? todayRef : null}
                onClick={() => handleDateClick(day)}
                disabled={isWeekendDay || isPast}
                className={`
                  flex flex-col items-center justify-center rounded-xl p-2 sm:p-3 min-w-[60px] sm:min-w-[70px] transition-all
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white scale-105 shadow-lg ring-2 ring-blue-400'
                      : isWeekendDay
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isPast
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isReserved
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105'
                      : 'bg-white text-gray-700 hover:bg-blue-100 hover:scale-105 shadow-sm'
                  }
                `}
              >
                <span className="text-[10px] sm:text-xs font-medium opacity-75 mb-1">
                  {dayName}
                </span>
                <span className="text-lg sm:text-2xl font-bold">
                  {day}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 sm:mt-6 space-y-1 sm:space-y-2 text-xs">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-600 text-xs">Odabrani dan</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 rounded"></div>
          <span className="text-gray-600 text-xs">Imate rezervaciju</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
          <span className="text-gray-600 text-xs">Vikend (nedostupno)</span>
        </div>
      </div>
    </div>
  )
}

