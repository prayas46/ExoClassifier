// Centralized API helper for the exoplanet-classifier backend
// Uses Vite env variable VITE_API_BASE_URL

const isDevelopment = import.meta.env.DEV;
const devApiUrl = "/api"; // Use proxy in development
const prodApiUrl = import.meta.env.VITE_API_BASE_URL || "https://exoplanet-classifier-backend-api.onrender.com";

export const API_BASE_URL = isDevelopment ? devApiUrl : prodApiUrl;

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
    console.log('Making request to:', `${API_BASE_URL}/`);
    const res = await fetch(`${API_BASE_URL}/`, { 
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
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
      throw new Error('Network error: Unable to connect to the API. This might be a CORS issue or the API is unreachable.');
    }
    throw error;
  }
}

export async function getModelInfo(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/model/info`, { method: "GET" });
  if (!res.ok) throw new Error(`Model info failed: ${res.status}`);
  return res.json();
}

export async function predictSingle(payload: Record<string, number | undefined>): Promise<PredictionResponse> {
  try {
    console.log('Making prediction request to:', `${API_BASE_URL}/predict/single`);
    console.log('Payload:', payload);
    const res = await fetch(`${API_BASE_URL}/predict/single`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });
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
      throw new Error('Network error: Unable to connect to the API for prediction. This might be a CORS issue.');
    }
    throw error;
  }
}

export async function predictCSV(file: File): Promise<PredictionResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CSV prediction failed: ${res.status} ${text}`);
  }
  return res.json();
}
