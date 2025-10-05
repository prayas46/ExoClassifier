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
    const form = new FormData();
    form.append("file", file);

    console.log('Making CSV prediction request to:', `${API_BASE_URL}/predict`);
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      mode: 'cors',
      body: form,
    });
    console.log('CSV prediction response status:', res.status);
    if (!res.ok) {
      const text = await res.text();
      console.error('CSV prediction error response:', text);
      throw new Error(`CSV prediction failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    console.log('CSV prediction response:', data);
    return data;
  } catch (error) {
    console.error('CSV prediction error details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const corsMessage = isDevelopment 
        ? 'Network error: Unable to connect to the API for CSV prediction.'
        : 'Network error: CORS policy is blocking the CSV prediction request.';
      throw new Error(corsMessage);
    }
    throw error;
  }
}
