// app/api/typhoons/route.ts
import { NextResponse } from 'next/server'

interface TyphoonData {
  id: string
  name: string
  category: string
  windSpeed: number
  pressure: number
  location: string
  timestamp: string
  latitude: number
  longitude: number
  severity: string
  description: string
  movement?: string
  forecast?: string
}

// Convert wind speed to category
function getCategory(windSpeedKmh: number): string {
  if (windSpeedKmh >= 240) return 'Super Typhoon'
  if (windSpeedKmh >= 185) return 'Typhoon'
  if (windSpeedKmh >= 118) return 'Severe Tropical Storm'
  if (windSpeedKmh >= 62) return 'Tropical Storm'
  return 'Tropical Depression'
}

// Check if coordinates are in Philippine Area of Responsibility (PAR)
function isInPAR(lat: number, lon: number): boolean {
  // PAR boundaries: 4-22°N, 115-135°E (slightly expanded)
  return lat >= 2 && lat <= 24 && lon >= 113 && lon <= 137
}

export async function GET() {
  try {
    const typhoons: TyphoonData[] = []
    
    console.log('Fetching typhoon data...')
    
    // Method 1: Try GDACS API (most reliable for recent/active disasters)
    try {
      const gdacsResponse = await fetch(
        'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP',
        {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      )

      if (gdacsResponse.ok) {
        const xmlText = await gdacsResponse.text()
        console.log('GDACS Response length:', xmlText.length)
        
        const itemRegex = /<item>([\s\S]*?)<\/item>/g
        const items = xmlText.match(itemRegex) || []
        console.log('GDACS items found:', items.length)
        
        for (const item of items) {
          const eventTypeMatch = item.match(/<gdacs:eventtype[^>]*>([^<]+)<\/gdacs:eventtype>/)
          const eventType = eventTypeMatch ? eventTypeMatch[1].trim() : ''
          
          // TC = Tropical Cyclone
          if (eventType.toLowerCase() === 'tc') {
            const titleMatch = item.match(/<title>([^<]+)<\/title>/)
            const descMatch = item.match(/<description>([^<]+)<\/description>/)
            const pubDateMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/)
            const latMatch = item.match(/<geo:lat>([^<]+)<\/geo:lat>/)
            const lonMatch = item.match(/<geo:long>([^<]+)<\/geo:long>/)
            const severityMatch = item.match(/<gdacs:severity[^>]*>([^<]+)<\/gdacs:severity>/)
            const linkMatch = item.match(/<link>([^<]+)<\/link>/)
            
            if (titleMatch && latMatch && lonMatch) {
              const lat = parseFloat(latMatch[1])
              const lon = parseFloat(lonMatch[1])
              
              console.log(`Found TC: ${titleMatch[1]} at ${lat}, ${lon}`)
              
              // Check if in Philippine area (expanded range)
              if (isInPAR(lat, lon)) {
                const title = titleMatch[1]
                const description = descMatch ? descMatch[1] : ''
                const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString()
                
                // Extract wind speed from description
                const windMatch = description.match(/wind speed:\s*(\d+)/i) || 
                                description.match(/(\d+)\s*km\/h/i) ||
                                description.match(/(\d+)\s*kph/i) ||
                                description.match(/winds?\s*(?:of|:)?\s*(\d+)/i)
                const windSpeed = windMatch ? parseInt(windMatch[1]) : 100
                
                // Extract pressure if available
                const pressureMatch = description.match(/(\d{3,4})\s*mb/i) ||
                                     description.match(/(\d{3,4})\s*hPa/i)
                const pressure = pressureMatch ? parseInt(pressureMatch[1]) : 0
                
                const category = getCategory(windSpeed)
                
                // Extract typhoon name from title
                const nameMatch = title.match(/(?:Typhoon|Storm|Cyclone)\s+([A-Z][a-z]+)/i) ||
                                 title.match(/\b([A-Z][A-Z]+)\b/) // All caps name
                let name = nameMatch ? nameMatch[1] : title
                
                // Clean up name
                name = name.replace(/Green |Orange |Red |Tropical Cyclone |alert/gi, '').trim()
                
                // Parse date - check if within last 30 days
                const stormDate = new Date(pubDate)
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                
                if (stormDate >= thirtyDaysAgo) {
                  console.log(`Adding typhoon: ${name} (${windSpeed} km/h)`)
                  
                  typhoons.push({
                    id: `gdacs-${Date.now()}-${Math.random()}`,
                    name: name || 'Unnamed Storm',
                    category: category,
                    windSpeed: windSpeed,
                    pressure: pressure,
                    location: `${lat.toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${lon.toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`,
                    timestamp: stormDate.toLocaleString('en-PH', {
                      timeZone: 'Asia/Manila',
                      dateStyle: 'medium',
                      timeStyle: 'medium',
                    }),
                    latitude: lat,
                    longitude: lon,
                    severity: severityMatch ? severityMatch[1] : category,
                    description: description.substring(0, 250) || `${category} affecting the Philippines`,
                    forecast: linkMatch ? `Details: ${linkMatch[1]}` : undefined
                  })
                }
              }
            }
          }
        }
        
        console.log(`Found ${typhoons.length} typhoons from GDACS in PAR`)
      }
    } catch (gdacsError) {
      console.error('GDACS fetch failed:', gdacsError)
    }

    // Method 2: Try ReliefWeb API for disaster reports
    try {
      const reliefwebResponse = await fetch(
        'https://api.reliefweb.int/v1/reports?appname=typhoon-tracker&filter[field]=disaster.type.name&filter[value]=Tropical Cyclone&filter[operator]=AND&filter[conditions][0][field]=country.name&filter[conditions][0][value]=Philippines&filter[conditions][1][field]=date.created&filter[conditions][1][value][from]=NOW-30DAYS&limit=20&sort[]=date:desc',
        {
          cache: 'no-store',
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      )

      if (reliefwebResponse.ok) {
        const reliefData = await reliefwebResponse.json()
        console.log('ReliefWeb reports found:', reliefData.data?.length || 0)
        
        if (reliefData.data && Array.isArray(reliefData.data)) {
          const seenNames = new Set(typhoons.map(t => t.name.toLowerCase()))
          
          for (const report of reliefData.data.slice(0, 5)) {
            const fields = report.fields
            const title = fields.title || 'Tropical Cyclone'
            const date = fields.date?.created || new Date().toISOString()
            
            // Extract typhoon name
            const nameMatch = title.match(/(?:Typhoon|Storm|Cyclone|Super Typhoon)\s+([A-Z][a-z]+|[A-Z]+)/i)
            const name = nameMatch ? nameMatch[1] : null
            
            if (name && !seenNames.has(name.toLowerCase())) {
              seenNames.add(name.toLowerCase())
              
              // Determine category from title
              let category = 'Tropical Storm'
              let windSpeed = 90
              
              if (title.toLowerCase().includes('super typhoon')) {
                category = 'Super Typhoon'
                windSpeed = 185
              } else if (title.toLowerCase().includes('typhoon')) {
                category = 'Typhoon'
                windSpeed = 150
              }
              
              console.log(`Adding from ReliefWeb: ${name}`)
              
              typhoons.push({
                id: `reliefweb-${Date.now()}-${Math.random()}`,
                name: name,
                category: category,
                windSpeed: windSpeed,
                pressure: 0,
                location: 'Philippines',
                timestamp: new Date(date).toLocaleString('en-PH', {
                  timeZone: 'Asia/Manila',
                  dateStyle: 'medium',
                  timeStyle: 'medium',
                }),
                latitude: 14.5995, // Central Philippines
                longitude: 120.9842,
                severity: category,
                description: fields.body?.substring(0, 200) || `${category} ${name} affecting the Philippines`,
              })
            }
          }
        }
      }
    } catch (reliefwebError) {
      console.error('ReliefWeb fetch failed:', reliefwebError)
    }

    // Remove duplicates by name
    const uniqueTyphoons = typhoons.filter((typhoon, index, self) =>
      index === self.findIndex((t) => {
        const tName = t.name.toLowerCase().replace(/\s+/g, '')
        const typhoonName = typhoon.name.toLowerCase().replace(/\s+/g, '')
        return tName === typhoonName
      })
    )
    
    // Sort by date (most recent first)
    uniqueTyphoons.sort((a, b) => {
      const dateA = new Date(a.timestamp)
      const dateB = new Date(b.timestamp)
      return dateB.getTime() - dateA.getTime()
    })
    
    console.log(`=== FINAL: Returning ${uniqueTyphoons.length} typhoons ===`)
    uniqueTyphoons.forEach(t => {
      console.log(`- ${t.name}: ${t.windSpeed} km/h at ${t.location}`)
    })
    
    return NextResponse.json(uniqueTyphoons)
    
  } catch (error) {
    console.error('Error fetching typhoon data:', error)
    return NextResponse.json([], { status: 200 })
  }
}