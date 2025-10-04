// Centralized API helper for the exoplanet-classifier backend
// Uses Vite env variable VITE_API_BASE_URL

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "/api";

if (!import.meta.env.VITE_API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE_URL is not defined. Defaulting to '/api' (dev proxy). Set it in .env for production.");
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
  const res = await fetch(`${API_BASE_URL}/`, { method: "GET" });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function getModelInfo(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/model/info`, { method: "GET" });
  if (!res.ok) throw new Error(`Model info failed: ${res.status}`);
  return res.json();
}

export async function predictSingle(payload: Record<string, number | undefined>): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE_URL}/predict/single`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Single prediction failed: ${res.status} ${text}`);
  }
  return res.json();
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
