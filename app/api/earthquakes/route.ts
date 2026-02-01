import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching earthquake data from PHIVOLCS...');
    
    // Try multiple endpoints and methods
    const endpoints = [
      'https://earthquake.phivolcs.dost.gov.ph/data/real_time_quakes.json',
      'http://earthquake.phivolcs.dost.gov.ph/data/real_time_quakes.json',
    ];
    
    let lastError = null;
    
    for (const url of endpoints) {
      try {
        console.log(`Trying endpoint: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data structure:', {
          hasData: !!data,
          isArray: Array.isArray(data),
          hasDataProperty: !!data?.data,
          dataLength: data?.data?.length || (Array.isArray(data) ? data.length : 0)
        });
        
        // Handle different response structures
        let earthquakes = [];
        if (data?.data && Array.isArray(data.data)) {
          earthquakes = data.data;
        } else if (Array.isArray(data)) {
          earthquakes = data;
        } else if (data?.features && Array.isArray(data.features)) {
          earthquakes = data.features;
        }
        
        console.log('Number of earthquakes:', earthquakes.length);
        
        if (earthquakes.length > 0) {
          console.log('Sample earthquake:', earthquakes[0]);
        }

        return NextResponse.json(earthquakes, {
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        });
        
      } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
        lastError = error;
        continue; // Try next endpoint
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error('All endpoints failed');
    
  } catch (error: unknown) {
    console.error("Error in earthquake API route:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          message: "Error fetching earthquake data", 
          error: error.message,
          details: error.stack,
          suggestion: "The PHIVOLCS API might be down or blocked. Try accessing https://earthquake.phivolcs.dost.gov.ph/data/real_time_quakes.json directly in your browser."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred" }, 
      { status: 500 }
    );
  }
}