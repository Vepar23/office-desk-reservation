import { NextRequest, NextResponse } from 'next/server'

// OpenWeatherMap API besplatno - registruj se na https://openweathermap.org/api
// 1000 calls/day besplatno

const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY || ''
const ZAGREB_LAT = '45.8150'
const ZAGREB_LON = '15.9819'

// Cache za weather data (5-minute cache)
let weatherCache: {
  data: any
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minuta

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format

    // Provjeri cache
    const now = Date.now()
    if (weatherCache && now - weatherCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(weatherCache.data, { status: 200 })
    }

    // Ako nema API key, vrati fallback
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_api_key_here') {
      return NextResponse.json({
        error: 'Weather API key nije postavljen',
        fallback: true,
        forecast: generateFallbackForecast()
      }, { status: 200 })
    }

    // Pozovi OpenWeatherMap API - 5 day forecast
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${ZAGREB_LAT}&lon=${ZAGREB_LON}&appid=${WEATHER_API_KEY}&units=metric&lang=hr`
    
    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache za 5 minuta
    })

    if (!response.ok) {
      throw new Error('Failed to fetch weather data')
    }

    const data = await response.json()

    // Parsiraj forecast po danima
    const forecastByDay = parseForecastByDay(data)

    // Spremi u cache
    weatherCache = {
      data: { forecast: forecastByDay },
      timestamp: now
    }

    return NextResponse.json({ forecast: forecastByDay }, { status: 200 })
  } catch (error) {
    console.error('Weather API error:', error)
    
    // Fallback na dummy data ako API ne radi
    return NextResponse.json({
      error: 'Greška pri dohvaćanju vremenske prognoze',
      fallback: true,
      forecast: generateFallbackForecast()
    }, { status: 200 })
  }
}

function parseForecastByDay(data: any) {
  const dailyForecasts: Record<string, any> = {}

  data.list.forEach((item: any) => {
    const date = item.dt_txt.split(' ')[0] // YYYY-MM-DD
    
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        date,
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        temp_avg: item.main.temp,
        weather: item.weather[0].main, // Clear, Clouds, Rain, Snow, etc.
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        count: 1
      }
    } else {
      // Update min/max temperature
      dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min)
      dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max)
      dailyForecasts[date].temp_avg += item.main.temp
      dailyForecasts[date].count++
    }
  })

  // Calculate average temperature
  Object.keys(dailyForecasts).forEach(date => {
    dailyForecasts[date].temp_avg = Math.round(
      dailyForecasts[date].temp_avg / dailyForecasts[date].count
    )
    dailyForecasts[date].temp_min = Math.round(dailyForecasts[date].temp_min)
    dailyForecasts[date].temp_max = Math.round(dailyForecasts[date].temp_max)
    delete dailyForecasts[date].count
  })

  return dailyForecasts
}

function generateFallbackForecast() {
  // Generiraj 7 dana fallback forecast
  const forecast: Record<string, any> = {}
  const today = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    // Random weather za demo
    const weathers = ['Clear', 'Clouds', 'Rain']
    const randomWeather = weathers[Math.floor(Math.random() * weathers.length)]

    forecast[dateStr] = {
      date: dateStr,
      temp_min: Math.round(5 + Math.random() * 5),
      temp_max: Math.round(15 + Math.random() * 10),
      temp_avg: Math.round(10 + Math.random() * 10),
      weather: randomWeather,
      description: randomWeather === 'Clear' ? 'vedro' : randomWeather === 'Clouds' ? 'oblačno' : 'kiša',
      icon: '01d',
      humidity: 60,
      wind_speed: 3.5,
    }
  }

  return forecast
}





