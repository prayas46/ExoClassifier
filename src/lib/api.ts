// Centralized API helper for the exoplanet-classifier backend
// Uses Vite env variable VITE_API_BASE_URL

const isDevelopment = import.meta.env.DEV;
const devApiUrl = "/api"; // Use proxy in development
const prodApiUrl = import.meta.env.VITE_API_BASE_URL || "https://exoplanet-classifier-backend-api.onrender.com";

// Use Vercel serverless proxy in production to handle CORS
const useProxy = import.meta.env.VITE_USE_PROXY === 'true' || !isDevelopment;
const proxyApiUrl = '/api/proxy'; // Vercel proxy endpoint

export const API_BASE_URL = isDevelopment ? devApiUrl : (useProxy ? proxyApiUrl : prodApiUrl);

if (isDevelopment) {
  // eslint-disable-next-line no-console
  console.log("Development mode: Using proxy at", API_BASE_URL);
} else {
  // eslint-disable-next-line no-console
  console.log("Production mode: Using API at", API_BASE_URL);
}

// Types that reflect backend responses (subset)
export interface PredictionItem {
  row_index: number;
  prediction: string;
  confidence: number; // backend returns 0..1 (probability)
  probabilities?: Record<string, number>;
}

export interface PredictionResponse {
  predictions: PredictionItem[];
  summary: Record<string, unknown>;
  processing_info: Record<string, unknown>;
}

export async function getHealth(): Promise<any> {
  try {
    console.log('Making health check request to:', API_BASE_URL);
    
    let requestUrl, requestOptions;
    
    if (isDevelopment || !useProxy) {
      // Direct request in development or when proxy is disabled
      requestUrl = `${API_BASE_URL}/`;
      requestOptions = {
        method: "GET",
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };
    } else {
      // Use proxy in production
      requestUrl = API_BASE_URL;
      requestOptions = {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: '/' })
      };
    }
    
    const res = await fetch(requestUrl, requestOptions);
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Health check failed: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Health check response:', data);
    return data;
  } catch (error) {
    console.error('Health check error details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const corsMessage = isDevelopment 
        ? 'Network error: Unable to connect to the API. Check if the backend is running.'
        : 'Network error: Unable to connect to the API through proxy.';
      throw new Error(corsMessage);
    }
    throw error;
  }
}

export async function getModelInfo(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/model/info`, { 
      method: "GET",
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Model info failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Model info error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the API for model info.');
    }
    throw error;
  }
}

// Keep-alive mechanism to prevent backend from sleeping
let keepAliveInterval: NodeJS.Timeout | null = null;

export function startKeepAlive() {
  if (keepAliveInterval) return; // Already running
  
  console.log('🐝 Starting keep-alive mechanism...');
  
  // Ping backend every 10 minutes to keep it awake
  keepAliveInterval = setInterval(async () => {
    try {
      console.log('📞 Keep-alive ping...');
      await getHealth(); // Simple health check
    } catch (error) {
      console.warn('Keep-alive ping failed:', error);
    }
  }, 10 * 60 * 1000); // 10 minutes
}

export function stopKeepAlive() {
  if (keepAliveInterval) {
    console.log('🛯 Stopping keep-alive mechanism');
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

// Warm-up function to wake up sleeping backend
// Use a robust timeout helper to avoid AbortSignal.timeout compatibility issues
const DEFAULT_TIMEOUT_MS = 30000;
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function warmUpBackend(): Promise<boolean> {
  try {
    console.log('🔥 Warming up backend service...');
    const startTime = Date.now();
    
    let requestUrl: string, requestOptions: RequestInit;
    
    if (isDevelopment || !useProxy) {
      requestUrl = `${API_BASE_URL}/`;
      requestOptions = {
        method: "GET",
        mode: 'cors' as RequestMode,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };
    } else {
      requestUrl = API_BASE_URL;
      requestOptions = {
        method: "POST",
        headers: {
          'Accept': 'application/json', 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: '/' }),
      };
    }
    
    const response = await fetchWithTimeout(requestUrl, requestOptions, DEFAULT_TIMEOUT_MS);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`🚀 Backend warmed up in ${duration}ms - Ready for predictions!`);
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Backend warm-up failed, but continuing with prediction:', error);
    return false; // Don't fail the prediction, just warn
  }
}

export async function predictSingle(payload: Record<string, number | undefined>): Promise<PredictionResponse> {
  try {
    console.log('Making prediction request, useProxy:', useProxy);
    console.log('Payload:', payload);
    
    let requestUrl, requestOptions;
    
    if (isDevelopment || !useProxy) {
      // Direct request in development or when proxy is disabled
      requestUrl = `${API_BASE_URL}/predict/single`;
      requestOptions = {
        method: "POST",
        mode: 'cors',
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      };
    } else {
      // Use proxy in production
      requestUrl = API_BASE_URL;
      requestOptions = {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ 
          path: '/predict/single',
          ...payload
        }),
      };
    }
    
    console.log('Request URL:', requestUrl);
    const res = await fetch(requestUrl, requestOptions);
    console.log('Prediction response status:', res.status);
    
    if (!res.ok) {
      const text = await res.text();
      console.error('Prediction error response:', text);
      throw new Error(`Single prediction failed: ${res.status} ${text}`);
    }
    
    const data = await res.json();
    console.log('Prediction response:', data);
    return data;
  } catch (error) {
    console.error('Prediction error details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const corsMessage = isDevelopment 
        ? 'Network error: Unable to connect to the API. Check if the backend is running.'
        : 'Network error: Unable to connect to the API. Using Vercel proxy to handle CORS.';
      throw new Error(corsMessage);
    }
    throw error;
  }
}

export async function predictCSV(file: File): Promise<PredictionResponse> {
  try {
    console.log('Processing CSV file for batch predictions...');
    
    // Read and parse the CSV file
    const content = await file.text();
    const lines = content.trim().split(/\r?\n/);
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row.');
    }

    // Parse CSV headers and data
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        if (value && value !== '') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            row[header] = numValue;
          }
        }
      });
      return row;
    });

    console.log(`Processing ${rows.length} rows from CSV`);

    // Map CSV columns to API expected format
    const mapCsvRowToApiFormat = (row: any) => {
      const apiRow: any = {};
      
      // Map common column names to API format
      const columnMapping = {
        'pl_orbper': 'pl_orbper',
        'orbital_period': 'pl_orbper',
        'pl_rade': 'pl_rade', 
        'planet_radius': 'pl_rade',
        'pl_trandep': 'pl_trandep',
        'transit_depth': 'pl_trandep',
        'pl_trandur': 'pl_trandur',
        'transit_duration': 'pl_trandur',
        'pl_bmasse': 'pl_bmasse',
        'planet_mass': 'pl_bmasse',
        'st_teff': 'st_teff',
        'stellar_temperature': 'st_teff',
        'st_rad': 'st_rad',
        'stellar_radius': 'st_rad',
        'sy_dist': 'sy_dist',
        'system_distance': 'sy_dist',
      };
      
      // Apply column mapping
      Object.keys(row).forEach(key => {
        const mappedKey = columnMapping[key] || key;
        if (row[key] !== undefined) {
          apiRow[mappedKey] = row[key];
        }
      });
      
      return apiRow;
    };

    // Process rows in batches to avoid overwhelming the API
    const batchSize = 10;
    const predictions = [];
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(rows.length/batchSize)}`);
      
      const batchPromises = batch.map(async (row, index) => {
        const apiPayload = mapCsvRowToApiFormat(row);
        console.log(`Predicting row ${i + index + 1}:`, Object.keys(apiPayload));
        
        try {
          const singleResult = await predictSingle(apiPayload);
          return {
            row_index: i + index,
            prediction: singleResult.predictions[0].prediction,
            confidence: singleResult.predictions[0].confidence,
            probabilities: singleResult.predictions[0].probabilities
          };
        } catch (error) {
          console.warn(`Failed to predict row ${i + index + 1}:`, error);
          return {
            row_index: i + index,
            prediction: 'FAILED',
            confidence: 0,
            error: error.message
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      predictions.push(...batchResults);
      
      // Small delay between batches to be nice to the API
      if (i + batchSize < rows.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Completed processing ${predictions.length} predictions`);

    // Return in the expected format
    return {
      predictions,
      summary: {
        total_rows: rows.length,
        successful_predictions: predictions.filter(p => p.prediction !== 'FAILED').length,
        failed_predictions: predictions.filter(p => p.prediction === 'FAILED').length
      },
      processing_info: {
        method: 'batch_single_predictions',
        file_name: file.name,
        file_size: file.size,
        batch_size: batchSize
      }
    };
  } catch (error) {
    console.error('CSV prediction error details:', error);
    throw error;
  }
}
