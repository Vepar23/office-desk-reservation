'use client'

import { useState, useEffect, useRef } from 'react'
import { isWeekend, isSameDay, formatDate } from '@/lib/utils'

interface WeatherData {
  date: string
  temp_avg: number
  temp_min: number
  temp_max: number
  weather: string
  description: string
  icon: string
}

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
  // Postavi trenutni mjesec na mjesec selektiranog datuma (ili danas ako nema selekcije)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const initial = selectedDate || new Date()
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLButtonElement>(null)
  
  // Weather data state
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({})
  const [weatherLoading, setWeatherLoading] = useState(true)

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

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true)
        const response = await fetch('/api/weather')
        const data = await response.json()
        
        if (data.forecast) {
          setWeatherData(data.forecast)
        }
      } catch (error) {
        console.error('Error fetching weather:', error)
      } finally {
        setWeatherLoading(false)
      }
    }

    fetchWeather()
  }, [])

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
  }, [currentMonth, weatherLoading]) // Also trigger when weather finishes loading

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
    // Koristi lokalni timezone umjesto UTC
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dayStr = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${dayStr}`
    return reservedDates.includes(dateString)
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Clear':
        return '☀️' // Sunce
      case 'Clouds':
        return '☁️' // Oblak
      case 'Rain':
      case 'Drizzle':
        return '🌧️' // Kiša
      case 'Snow':
        return '❄️' // Snijeg
      case 'Thunderstorm':
        return '⛈️' // Grmljavina
      case 'Mist':
      case 'Fog':
        return '🌫️' // Magla
      default:
        return '🌤️' // Djelomično oblačno (default)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 transition-colors">
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
        <h2 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">
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

            const dateStr = formatDate(date)
            const weather = weatherData[dateStr]

            return (
              <button
                key={day}
                ref={isToday ? todayRef : null}
                onClick={() => handleDateClick(day)}
                disabled={isWeekendDay || isPast}
                className={`
                  flex flex-col items-center justify-center rounded-xl p-2 sm:p-3 min-w-[70px] sm:min-w-[80px] transition-all
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
                <span className="text-lg sm:text-2xl font-bold mb-1">
                  {day}
                </span>
                
                {/* Weather Info */}
                {weather && !weatherLoading && (
                  <div className="flex flex-col items-center mt-1 border-t border-gray-200 pt-1 w-full">
                    <span className="text-lg sm:text-xl mb-0.5">{getWeatherIcon(weather.weather)}</span>
                    <span className={`text-[10px] sm:text-xs font-semibold ${
                      isSelected ? 'text-white' : 'text-blue-600'
                    }`}>
                      {weather.temp_avg}°C
                    </span>
                  </div>
                )}
                
                {weatherLoading && (
                  <div className="mt-1 h-8 w-full flex items-center justify-center">
                    <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  </div>
                )}
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

