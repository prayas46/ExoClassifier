import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip as UiTooltip, TooltipContent as UiTooltipContent, TooltipTrigger as UiTooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Rocket, BarChart3, Globe, Star, Zap, Upload, Download, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import LightCurveGraph from "@/components/viz/LightCurveGraph";
import TransitGeometryDiagram from "@/components/viz/TransitGeometryDiagram";
import RadialVelocityGraph from "@/components/viz/RadialVelocityGraph";
import HabitableZoneViz from "@/components/viz/HabitableZoneViz";
import StellarComparison from "@/components/viz/StellarComparison";
import PlanetScatterPlot from "@/components/viz/PlanetScatterPlot";
import ConfidenceHeatmap from "@/components/viz/ConfidenceHeatmap";
import AnimatedResultsFlow from "@/components/viz/AnimatedResultsFlow";
import PhaseFoldedTransit from "@/components/viz/PhaseFoldedTransit";
import { toast } from "@/hooks/use-toast";
import { predictSingle, predictCSV, warmUpBackend, startKeepAlive, stopKeepAlive, type PredictionResponse } from "@/lib/api";
import InteractivePlanet from "@/components/InteractivePlanet";

type AnalysisMode = "single" | "batch";

interface ClassificationResult {
  planet_type: string;
  confidence: number;
  habitability_score: number;
  size_category: string;
  temperature: number;
}

interface BatchResult extends ClassificationResult {
  id: number;
  timestamp: string;
}

interface ParameterValidation {
  min: number;
  max: number;
  typical_min: number;
  typical_max: number;
  step: number;
  unit: string;
}

interface ValidationError {
  parameter: string;
  message: string;
}

interface PredictionHistory {
  timestamp: string;
  inputs: Record<string, number>;
  result: ClassificationResult;
  mode: AnalysisMode;
}

// Parameter validation ranges
const PARAMETER_RANGES: Record<string, ParameterValidation> = {
  orbital_period: { min: 0.5, max: 1000, typical_min: 1, typical_max: 500, step: 0.01, unit: "days" },
  planet_radius: { min: 0.1, max: 10, typical_min: 0.5, typical_max: 5, step: 0.01, unit: "Earth radii" },
  transit_depth: { min: 10, max: 5000, typical_min: 100, typical_max: 3000, step: 10, unit: "ppm" },
  transit_duration: { min: 0.5, max: 12, typical_min: 1, typical_max: 8, step: 0.1, unit: "hours" },
  planet_mass: { min: 0.01, max: 10, typical_min: 0.1, typical_max: 5, step: 0.01, unit: "Earth masses" },
  stellar_temperature: { min: 2000, max: 10000, typical_min: 3000, typical_max: 8000, step: 50, unit: "K" },
  stellar_radius: { min: 0.1, max: 5, typical_min: 0.5, typical_max: 2, step: 0.01, unit: "Solar radii" },
  system_distance: { min: 1, max: 1000, typical_min: 10, typical_max: 500, step: 1, unit: "pc" }
};

// Example presets
const PRESETS = {
  "Earth-like": {
    orbital_period: 365.25,
    planet_radius: 1.0,
    transit_depth: 840,
    transit_duration: 3.5,
    planet_mass: 1.0,
    stellar_temperature: 5778,
    stellar_radius: 1.0,
    system_distance: 150
  },
  "Hot Jupiter": {
    orbital_period: 3.5,
    planet_radius: 11.2,
    transit_depth: 12000,
    transit_duration: 2.8,
    planet_mass: 317.8,
    stellar_temperature: 6200,
    stellar_radius: 1.2,
    system_distance: 200
  },
  "Super-Earth": {
    orbital_period: 85.5,
    planet_radius: 1.6,
    transit_depth: 1200,
    transit_duration: 4.2,
    planet_mass: 4.8,
    stellar_temperature: 5200,
    stellar_radius: 0.9,
    system_distance: 120
  }
};

const COLORS = {
  'Earth-like': '#22c55e',
  'Super-Earth': '#3b82f6',
  'Gas Giant': '#f59e0b',
  'Hot Jupiter': '#ef4444',
  'Neptune-like': '#8b5cf6',
  'Rocky': '#84cc16'
};

export default function Classifier() {
  const [mode, setMode] = useState<AnalysisMode>("single");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchRows, setBatchRows] = useState<Record<string, any>[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [backendWarming, setBackendWarming] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Parameter states
  const [orbitalPeriod, setOrbitalPeriod] = useState([365.25]);
  const [planetRadius, setPlanetRadius] = useState([1.0]);
  const [transitDepth, setTransitDepth] = useState([1000]);
  const [transitDuration, setTransitDuration] = useState([3.5]);
  const [planetMass, setPlanetMass] = useState([1.0]);
  const [stellarTemp, setStellarTemp] = useState([5778]);
  const [stellarRadius, setStellarRadius] = useState([1.0]);
  const [systemDistance, setSystemDistance] = useState([200]);

  // Advanced optional parameters (undefined means not included in payload)
  const [plInsol, setPlInsol] = useState<number | undefined>(undefined);
  const [plEqt, setPlEqt] = useState<number | undefined>(undefined);
  const [stSlogg, setStSlogg] = useState<number | undefined>(undefined);
  const [plImpact, setPlImpact] = useState<number | undefined>(undefined);
  const [plSnr, setPlSnr] = useState<number | undefined>(undefined);
  const [transitCount, setTransitCount] = useState<number | undefined>(undefined);
  const [koiScore, setKoiScore] = useState<number | undefined>(undefined);
  const [plOrbsmax, setPlOrbsmax] = useState<number | undefined>(undefined);
  const [plDensity, setPlDensity] = useState<number | undefined>(undefined);
  const [depthRatio, setDepthRatio] = useState<number | undefined>(undefined);
  const [snrQuality, setSnrQuality] = useState<number | undefined>(undefined);
  const [transitSignal, setTransitSignal] = useState<number | undefined>(undefined);
  const [hzRatio, setHzRatio] = useState<number | undefined>(undefined);
  const [stMassProxy, setStMassProxy] = useState<number | undefined>(undefined);

  // Tri-state flags: undefined (unset), 0 (no), 1 (yes)
  const [fpFlagNt, setFpFlagNt] = useState<number | undefined>(undefined);
  const [fpFlagCo, setFpFlagCo] = useState<number | undefined>(undefined);
  const [fpFlagSs, setFpFlagSs] = useState<number | undefined>(undefined);
  const [fpFlagEc, setFpFlagEc] = useState<number | undefined>(undefined);
  const [fpFlagAny, setFpFlagAny] = useState<number | undefined>(undefined);

  // Validation function
  const validateParameters = useCallback(() => {
    const errors: ValidationError[] = [];
    const params = {
      orbital_period: orbitalPeriod[0],
      planet_radius: planetRadius[0],
      transit_depth: transitDepth[0],
      transit_duration: transitDuration[0],
      planet_mass: planetMass[0],
      stellar_temperature: stellarTemp[0],
      stellar_radius: stellarRadius[0],
      system_distance: systemDistance[0]
    };

    Object.entries(params).forEach(([key, value]) => {
      const range = PARAMETER_RANGES[key];
      if (value < range.min || value > range.max) {
        errors.push({
          parameter: key,
          message: `Value must be between ${range.min} and ${range.max} ${range.unit}`
        });
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [orbitalPeriod, planetRadius, transitDepth, transitDuration, planetMass, stellarTemp, stellarRadius, systemDistance]);

  // Effect to validate parameters on change
  useEffect(() => {
    validateParameters();
  }, [validateParameters]);

  // Proactive backend warm-up on component mount
  useEffect(() => {
    const warmUpBackendProactively = async () => {
      try {
        console.log('🚀 Proactively warming up backend on page load...');
        const success = await warmUpBackend();
        setBackendReady(success);
        
        if (success) {
          // Start keep-alive to prevent backend from sleeping again
          startKeepAlive();
          
          toast({
            title: "Backend Ready",
            description: "ML model loaded successfully. Predictions will be fast!",
          });
        } else {
          toast({
            title: "Backend Warming",
            description: "Backend is starting up. First prediction may take longer.",
            variant: "default",
          });
        }
      } catch (error) {
        console.warn('Proactive warm-up failed:', error);
        setBackendReady(false);
      } finally {
        setBackendWarming(false);
      }
    };

    // Start warm-up after a short delay to not block initial render
    const timer = setTimeout(warmUpBackendProactively, 1000);
    
    return () => {
      clearTimeout(timer);
      // Stop keep-alive when component unmounts
      stopKeepAlive();
    };
  }, []); // Run once on mount

  // Reset to defaults
  const resetToDefaults = () => {
    setOrbitalPeriod([365.25]);
    setPlanetRadius([1.0]);
    setTransitDepth([1000]);
    setTransitDuration([3.5]);
    setPlanetMass([1.0]);
    setStellarTemp([5778]);
    setStellarRadius([1.0]);
    setSystemDistance([200]);
  };

  // Apply preset
  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName as keyof typeof PRESETS];
    if (preset) {
      setOrbitalPeriod([preset.orbital_period]);
      setPlanetRadius([preset.planet_radius]);
      setTransitDepth([preset.transit_depth]);
      setTransitDuration([preset.transit_duration]);
      setPlanetMass([preset.planet_mass]);
      setStellarTemp([preset.stellar_temperature]);
      setStellarRadius([preset.stellar_radius]);
      setSystemDistance([preset.system_distance]);
      toast({
        title: "Preset Applied",
        description: `${presetName} parameters loaded successfully.`
      });
    }
  };

  // Small info hint component
  const InfoHint = ({ text }: { text: string }) => (
    <UiTooltip>
      <UiTooltipTrigger asChild>
        <span className="ml-2 inline-flex items-center justify-center rounded-sm bg-primary/15 text-primary text-[10px] font-semibold w-4 h-4 cursor-help">i</span>
      </UiTooltipTrigger>
      <UiTooltipContent className="text-xs max-w-xs">{text}</UiTooltipContent>
    </UiTooltip>
  );

  // Manual input handlers
  const handleManualInput = (value: string, setter: (val: number[]) => void, _paramKey: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Allow free numeric input without clamping to slider ranges
      setter([numValue]);
    }
  };

  // CSV file processing
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setUploadError('Please upload a CSV file.');
        return;
      }
      setCsvFile(file);
      setUploadError('');
      console.log('CSV file uploaded:', file.name);
    }
  }, []);

  // Parse CSV content (flexible headers like exoplanet-classifier)
  const parseCsvContent = (content: string): Record<string, any>[] => {
    const lines = content.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row.');
    }

    // Normalize header names
    const rawHeaders = lines[0].split(',');
    const normalize = (h: string) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const headers = rawHeaders.map(h => normalize(h));

    // Canonical base feature names used by UI visualizations
    const canonicalBase = ['orbital_period','planet_radius','transit_depth','transit_duration','planet_mass','stellar_temperature','stellar_radius','system_distance'];

    // Map various synonyms to our canonical base keys
    const baseSynonyms: Record<string, string> = {
      // orbital period
      'pl_orbper': 'orbital_period',
      'orbital_period': 'orbital_period',
      'orbitalperiod': 'orbital_period',
      'orbital_period_days': 'orbital_period',
      // planet radius
      'pl_rade': 'planet_radius',
      'planet_radius': 'planet_radius',
      'planetradius': 'planet_radius',
      'planet_radius_earth_radii': 'planet_radius',
      // transit depth
      'pl_trandep': 'transit_depth',
      'transit_depth': 'transit_depth',
      'transitdepth': 'transit_depth',
      'depth_ppm': 'transit_depth',
      // transit duration
      'pl_trandur': 'transit_duration',
      'transit_duration': 'transit_duration',
      'transitduration': 'transit_duration',
      'duration_hours': 'transit_duration',
      // planet mass
      'pl_bmasse': 'planet_mass',
      'planet_mass': 'planet_mass',
      'planetmass': 'planet_mass',
      // stellar temp
      'st_teff': 'stellar_temperature',
      'stellar_temperature': 'stellar_temperature',
      'stellartemperature': 'stellar_temperature',
      // stellar radius
      'st_rad': 'stellar_radius',
      'stellar_radius': 'stellar_radius',
      'stellarradius': 'stellar_radius',
      // system distance
      'sy_dist': 'system_distance',
      'system_distance': 'system_distance',
      'systemdistance': 'system_distance',
      'distance_pc': 'system_distance',
    };

    // Optional advanced columns (accept as-is if present)
    const optionalColumns = [
      'pl_insol','pl_eqt','st_slogg','pl_impact','pl_snr','transit_count','koi_score','pl_orbsmax',
      'pl_density','depth_ratio','snr_quality','transit_signal','hz_ratio','st_mass_proxy',
      'fp_flag_nt','fp_flag_co','fp_flag_ss','fp_flag_ec','fp_flag_any'
    ];

    // Build an index mapping from canonical/optional keys to column index
    const indexMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      const canonical = baseSynonyms[h];
      if (canonical) indexMap[canonical] = i;
      if (optionalColumns.includes(h)) indexMap[h] = i;
      // Also keep original normalized header if not matched
      if (!canonical && !optionalColumns.includes(h)) {
        // no-op, unknown columns ignored
      }
    });

    // If none of the core base columns exist, show a helpful error
    const hasAnyBase = canonicalBase.some(k => indexMap[k] !== undefined);
    if (!hasAnyBase) {
      throw new Error('CSV must include at least one core column (e.g., orbital_period/pl_orbper, planet_radius/pl_rade, etc.). Headers are case-insensitive and flexible.');
    }

    return lines.slice(1).map((line, index) => {
      if (!line.trim()) return { id: index + 1 };
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, any> = { id: index + 1 };

      // Fill canonical base keys if present
      canonicalBase.forEach((key) => {
        const col = indexMap[key];
        if (col === undefined) return;
        const v = values[col];
        if (v === undefined || v === '') return;
        const num = parseFloat(v);
        if (!Number.isNaN(num)) row[key] = num;
      });

      // Fill optional advanced keys
      optionalColumns.forEach((key) => {
        const col = indexMap[key];
        if (col === undefined) return;
        const v = values[col];
        if (v === undefined || v === '') return;
        const num = parseFloat(v);
        if (!Number.isNaN(num)) row[key] = num;
      });

      return row;
    });
  };

  // Export results to CSV
  const exportResults = () => {
    if (mode === 'single' && result) {
      const csvContent = `timestamp,orbital_period,planet_radius,transit_depth,transit_duration,planet_mass,stellar_temperature,stellar_radius,system_distance,planet_type,confidence,habitability_score,size_category,temperature\n` +
        `${new Date().toISOString()},${orbitalPeriod[0]},${planetRadius[0]},${transitDepth[0]},${transitDuration[0]},${planetMass[0]},${stellarTemp[0]},${stellarRadius[0]},${systemDistance[0]},${result.planet_type},${result.confidence},${result.habitability_score},${result.size_category},${result.temperature}`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exoplanet_classification_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (mode === 'batch' && batchResults.length > 0) {
      const headers = 'id,timestamp,orbital_period,planet_radius,transit_depth,transit_duration,planet_mass,stellar_temperature,stellar_radius,system_distance,planet_type,confidence,habitability_score,size_category,temperature';
      const rows = batchResults.map(result => 
        `${result.id},${result.timestamp},,,,,,,,,${result.planet_type},${result.confidence},${result.habitability_score},${result.size_category},${result.temperature}`
      ).join('\n');
      
      const csvContent = headers + '\n' + rows;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_classification_results_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Add to history
  const addToHistory = (inputs: Record<string, number>, result: ClassificationResult) => {
    const newEntry: PredictionHistory = {
      timestamp: new Date().toISOString(),
      inputs,
      result,
      mode
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 4)]); // Keep last 5
  };

  // Single planet classification
  const handleClassification = async () => {
    if (!validateParameters()) {
      toast({
        title: "Validation Error",
        description: "Please fix the parameter validation errors before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Map UI fields to backend expected payload (PredictionRequest)
    const payload: Record<string, number> = {
      pl_orbper: orbitalPeriod[0],
      pl_rade: planetRadius[0],
      pl_trandep: transitDepth[0],
      pl_trandur: transitDuration[0],
      pl_bmasse: planetMass[0],
      st_teff: stellarTemp[0],
      st_rad: stellarRadius[0],
      sy_dist: systemDistance[0],
    };

    // Include advanced fields only if provided
    const advanced: Record<string, number | undefined> = {
      pl_insol: plInsol,
      pl_eqt: plEqt,
      st_slogg: stSlogg,
      pl_impact: plImpact,
      pl_snr: plSnr,
      transit_count: transitCount,
      koi_score: koiScore,
      pl_orbsmax: plOrbsmax,
      pl_density: plDensity,
      depth_ratio: depthRatio,
      snr_quality: snrQuality,
      transit_signal: transitSignal,
      hz_ratio: hzRatio,
      st_mass_proxy: stMassProxy,
      fp_flag_nt: fpFlagNt,
      fp_flag_co: fpFlagCo,
      fp_flag_ss: fpFlagSs,
      fp_flag_ec: fpFlagEc,
      fp_flag_any: fpFlagAny,
    };
    Object.entries(advanced).forEach(([k, v]) => {
      if (typeof v === 'number' && !Number.isNaN(v)) payload[k] = v;
    });

    setIsAnalyzing(true);
    try {
      // Warm up the backend first to avoid cold start delays (only if not already ready)
      if (!backendReady) {
        console.log('🔥 Backend not ready, warming up before prediction...');
        const warmUpSuccess = await warmUpBackend();
        
        if (warmUpSuccess) {
          console.log('✅ Backend warmed up and ready for predictions');
          setBackendReady(true);
        } else {
          console.log('⚠️ Warm-up failed, but attempting prediction anyway');
        }
      } else {
        console.log('✨ Backend already ready, proceeding with prediction');
      }

      const response: PredictionResponse = await predictSingle(payload);
      const item = response.predictions[0];

      // Backend confidence is typically 0..1 — convert to % if needed
      const confidencePct = item.confidence <= 1 ? item.confidence * 100 : item.confidence;
      const habitability = (() => {
        const probConfirmed = item.probabilities?.CONFIRMED ?? item.probabilities?.Confirmed ?? undefined;
        if (typeof probConfirmed === 'number') return probConfirmed * 100;
        return confidencePct;
      })();

      const mapped: ClassificationResult = {
        planet_type: item.prediction,
        confidence: confidencePct,
        habitability_score: habitability,
        size_category:
          planetRadius[0] > 4
            ? "Jupiter-sized"
            : planetRadius[0] > 2
            ? "Neptune-sized"
            : planetRadius[0] > 1.25
            ? "Super-Earth"
            : "Earth-sized",
        temperature: Math.round(
          stellarTemp[0] * Math.pow(stellarRadius[0] / Math.sqrt(orbitalPeriod[0] / 365.25), 0.5)
        ),
      };

      setResult(mapped);
      setBackendReady(true);
      addToHistory(
        {
          orbital_period: orbitalPeriod[0],
          planet_radius: planetRadius[0],
          transit_depth: transitDepth[0],
          transit_duration: transitDuration[0],
          planet_mass: planetMass[0],
          stellar_temperature: stellarTemp[0],
          stellar_radius: stellarRadius[0],
          system_distance: systemDistance[0],
        },
        mapped
      );

      toast({
        title: "Classification Complete",
        description: `Planet classified as ${mapped.planet_type} with ${mapped.confidence.toFixed(1)}% confidence.`,
      });
    } catch (err: any) {
      console.error("Single prediction error:", err);
      toast({
        title: "Prediction Error",
        description: err?.message || "Failed to classify exoplanet.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Batch classification
  const handleBatchAnalysis = async () => {
    if (!csvFile) {
      setUploadError('Please select a CSV file first.');
      return;
    }

    setIsAnalyzing(true);
    setUploadError('');
    console.log('Starting batch analysis with file:', csvFile.name);
    
    // Show initial toast
    toast({
      title: "Starting Batch Analysis",
      description: `Processing ${csvFile.name}... This may take a few minutes.`
    });

    try {
      // Keep parsing locally so we can power the visualizations
      const content = await csvFile.text();
      const data = parseCsvContent(content);
      setBatchRows(data);

      // Send file to backend
      const resp = await predictCSV(csvFile);

      // Map backend predictions to our BatchResult shape, aligning by row index if present
      const results: BatchResult[] = resp.predictions.map((p, i) => {
        const row = data[i] ?? {};
        const confPct = p.confidence <= 1 ? p.confidence * 100 : p.confidence;
        const probConfirmed = p.probabilities?.CONFIRMED ?? p.probabilities?.Confirmed;
        const habitability = typeof probConfirmed === 'number' ? probConfirmed * 100 : confPct;
        const pr = typeof row.planet_radius === 'number' ? row.planet_radius : undefined;
        const sr = typeof row.stellar_radius === 'number' ? row.stellar_radius : undefined;
        const op = typeof row.orbital_period === 'number' ? row.orbital_period : undefined;
        const st = typeof row.stellar_temperature === 'number' ? row.stellar_temperature : undefined;

        const sizeCategory = pr && (pr > 4 ? "Jupiter-sized" : pr > 2 ? "Neptune-sized" : pr > 1.25 ? "Super-Earth" : "Earth-sized");
        const temperature = st && sr && op
          ? Math.round(st * Math.pow(sr / Math.sqrt(op / 365.25), 0.5))
          : 0;

        return {
          id: row.id ?? i + 1,
          timestamp: new Date().toISOString(),
          planet_type: p.prediction,
          confidence: confPct,
          habitability_score: habitability,
          size_category: sizeCategory || "",
          temperature,
        } as BatchResult;
      });

      setBatchResults(results);

      const successful = results.filter(r => r.planet_type !== 'FAILED').length;
      const failed = results.length - successful;
      
      toast({
        title: "Batch Analysis Complete",
        description: `Successfully classified ${successful} exoplanets.${failed > 0 ? ` ${failed} failed.` : ''}`,
      });
    } catch (error: any) {
      console.error('Batch analysis error:', error);
      setUploadError(error.message);
      toast({
        title: "Batch Analysis Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Confidence gauge component
  const ConfidenceGauge = ({ confidence, planetType }: { confidence: number, planetType: string }) => {
    const color = COLORS[planetType as keyof typeof COLORS] || '#6b7280';
    const data = [
      { name: 'Confidence', value: confidence },
      { name: 'Remaining', value: 100 - confidence }
    ];

    return (
      <div className="relative w-32 h-16 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={30}
              outerRadius={50}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-lg font-bold" style={{ color }}>
            {confidence.toFixed(1)}%
          </div>
        </div>
      </div>
    );
  };

  // Batch results distribution chart
  const BatchDistributionChart = ({ results }: { results: BatchResult[] }) => {
    const distribution = results.reduce((acc, result) => {
      acc[result.planet_type] = (acc[result.planet_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(distribution).map(([type, count]) => ({
      type,
      count,
      fill: COLORS[type as keyof typeof COLORS] || '#6b7280'
    }));

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Parameter comparison component
  const ParameterComparison = () => {
    const parameters = [
      { key: 'orbital_period', value: orbitalPeriod[0], name: 'Orbital Period' },
      { key: 'planet_radius', value: planetRadius[0], name: 'Planet Radius' },
      { key: 'transit_depth', value: transitDepth[0], name: 'Transit Depth' },
      { key: 'stellar_temperature', value: stellarTemp[0], name: 'Stellar Temperature' }
    ];

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Parameter Ranges</h4>
        {parameters.map(param => {
          const range = PARAMETER_RANGES[param.key];
          const userPercent = ((param.value - range.min) / (range.max - range.min)) * 100;
          const typicalStart = ((range.typical_min - range.min) / (range.max - range.min)) * 100;
          const typicalEnd = ((range.typical_max - range.min) / (range.max - range.min)) * 100;
          
          return (
            <div key={param.key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{param.name}</span>
                <span>{param.value} {range.unit}</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded">
                <div 
                  className="absolute h-full bg-blue-200 rounded"
                  style={{
                    left: `${typicalStart}%`,
                    width: `${typicalEnd - typicalStart}%`
                  }}
                />
                <div
                  className="absolute w-1 h-full bg-primary rounded"
                  style={{ left: `${Math.max(0, Math.min(100, userPercent))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{range.min}</span>
                <span>typical</span>
                <span>{range.max}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section id="classifier" className="relative w-full py-20 px-4 bg-background">
      <div className="container mx-auto w-full">
        {/* Loading Overlay */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-card p-8 rounded-3xl shadow-2xl text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analyzing Exoplanets</h3>
              <p className="text-muted-foreground">
                {mode === 'batch' 
                  ? 'Processing CSV file row by row using individual predictions... This may take a few minutes for large files.' 
                  : 'Warming up backend service and loading ML model... First prediction may take 15-30 seconds.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Tab Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center gap-4 mb-8"
        >
          <button
            onClick={() => setMode("single")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
              mode === "single"
                ? "bg-card text-primary border border-primary/30 shadow-lg"
                : "bg-card/50 text-muted-foreground border border-border hover:border-primary/20"
            }`}
          >
            <Rocket className="w-4 h-4" />
            Single Planet Analysis
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
              mode === "batch"
                ? "bg-card text-primary border border-primary/30 shadow-lg"
                : "bg-card/50 text-muted-foreground border border-border hover:border-primary/20"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Batch Analysis
          </button>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Classifier Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card rounded-3xl p-8 md:p-12 shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl md:text-4xl font-light text-primary">
                {mode === "single" ? "Single Planet Analysis" : "Batch Analysis"}
              </h2>
              
              {/* Backend Status Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  backendWarming 
                    ? 'bg-yellow-500 animate-pulse' 
                    : backendReady 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`} />
                <span className="text-muted-foreground">
                  {backendWarming 
                    ? 'Backend warming...' 
                    : backendReady 
                    ? 'ML model ready' 
                    : 'Backend offline'
                  }
                </span>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-8">
              {mode === "single"
                ? "Enter the parameters of an exoplanet to get its classification. You don't need to fill all fields - the model will use available data."
                : "Upload a CSV file with multiple exoplanet observations for batch classification."}
            </p>

          {mode === "single" ? (
            <div className="space-y-8">
              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="text-sm">
                          <strong>{error.parameter.replace('_', ' ')}:</strong> {error.message}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Example Presets */}
              <div className="mb-6">
                <Label className="text-base font-medium mb-3 block">Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRESETS).map(presetName => (
                    <Button
                      key={presetName}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(presetName)}
                      className="text-xs"
                    >
                      {presetName}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Row 1: Orbital Period, Planet Radius */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="orbital-period" className={`flex items-center gap-2 text-base font-medium ${
                    validationErrors.some(e => e.parameter === 'orbital_period') ? 'text-red-500' : ''
                  }`}>
                    Orbital Period (days): {orbitalPeriod[0].toFixed(2)}
                    {validationErrors.some(e => e.parameter === 'orbital_period') && 
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    }
                  </Label>
                  <div className="space-y-2">
                  <Input
                      type="number"
                      placeholder="Enter value"
                      value={orbitalPeriod[0]}
                      onChange={(e) => handleManualInput(e.target.value, setOrbitalPeriod, 'orbital_period')}
                      step={PARAMETER_RANGES.orbital_period.step}
                      className="w-full"
                    />
                    <Slider
                      id="orbital-period"
                      value={orbitalPeriod}
                      onValueChange={setOrbitalPeriod}
                      max={PARAMETER_RANGES.orbital_period.max}
                      min={PARAMETER_RANGES.orbital_period.min}
                      step={PARAMETER_RANGES.orbital_period.step}
                      className={`w-full ${
                        validationErrors.some(e => e.parameter === 'orbital_period') ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="planet-radius" className={`flex items-center gap-2 text-base font-medium ${
                    validationErrors.some(e => e.parameter === 'planet_radius') ? 'text-red-500' : ''
                  }`}>
                    Planet Radius (Earth radii): {planetRadius[0].toFixed(2)}
                    {validationErrors.some(e => e.parameter === 'planet_radius') && 
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    }
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={planetRadius[0]}
                      onChange={(e) => handleManualInput(e.target.value, setPlanetRadius, 'planet_radius')}
                      step={PARAMETER_RANGES.planet_radius.step}
                      className="w-full"
                    />
                    <Slider
                      id="planet-radius"
                      value={planetRadius}
                      onValueChange={setPlanetRadius}
                      max={PARAMETER_RANGES.planet_radius.max}
                      min={PARAMETER_RANGES.planet_radius.min}
                      step={PARAMETER_RANGES.planet_radius.step}
                      className={`w-full ${
                        validationErrors.some(e => e.parameter === 'planet_radius') ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Transit Depth, Transit Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="transit-depth" className="flex items-center gap-2 text-base font-medium">
                    Transit Depth (ppm): {transitDepth[0].toFixed(0)}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={transitDepth[0]}
                      onChange={(e) => handleManualInput(e.target.value, setTransitDepth, 'transit_depth')}
                      step={PARAMETER_RANGES.transit_depth.step}
                      className="w-full"
                    />
                    <Slider
                      id="transit-depth"
                      value={transitDepth}
                      onValueChange={setTransitDepth}
                      max={5000}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="transit-duration" className="flex items-center gap-2 text-base font-medium">
                    Transit Duration (hours): {transitDuration[0].toFixed(1)}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={transitDuration[0]}
                      onChange={(e) => handleManualInput(e.target.value, setTransitDuration, 'transit_duration')}
                      step={PARAMETER_RANGES.transit_duration.step}
                      className="w-full"
                    />
                    <Slider
                      id="transit-duration"
                      value={transitDuration}
                      onValueChange={setTransitDuration}
                      max={12}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Planet Mass, Stellar Temperature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="planet-mass" className="flex items-center gap-2 text-base font-medium">
                    Planet Mass (Earth masses): {planetMass[0].toFixed(2)}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={planetMass[0]}
                      onChange={(e) => handleManualInput(e.target.value, setPlanetMass, 'planet_mass')}
                      step={PARAMETER_RANGES.planet_mass.step}
                      className="w-full"
                    />
                    <Slider
                      id="planet-mass"
                      value={planetMass}
                      onValueChange={setPlanetMass}
                      max={10}
                      min={0.01}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="stellar-temp" className="flex items-center gap-2 text-base font-medium">
                    Stellar Temperature (K): {stellarTemp[0].toFixed(0)}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={stellarTemp[0]}
                      onChange={(e) => handleManualInput(e.target.value, setStellarTemp, 'stellar_temperature')}
                      step={PARAMETER_RANGES.stellar_temperature.step}
                      className="w-full"
                    />
                    <Slider
                      id="stellar-temp"
                      value={stellarTemp}
                      onValueChange={setStellarTemp}
                      max={10000}
                      min={2000}
                      step={50}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Stellar Radius, System Distance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="stellar-radius" className="flex items-center gap-2 text-base font-medium">
                    Stellar Radius (Solar radii): {stellarRadius[0].toFixed(2)}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={stellarRadius[0]}
                      onChange={(e) => handleManualInput(e.target.value, setStellarRadius, 'stellar_radius')}
                      step={PARAMETER_RANGES.stellar_radius.step}
                      className="w-full"
                    />
                    <Slider
                      id="stellar-radius"
                      value={stellarRadius}
                      onValueChange={setStellarRadius}
                      max={5}
                      min={0.1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="system-distance" className="flex items-center gap-2 text-base font-medium">
                    System Distance (pc): {systemDistance[0].toFixed(0)}
                  </Label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={systemDistance[0]}
                      onChange={(e) => handleManualInput(e.target.value, setSystemDistance, 'system_distance')}
                      step={PARAMETER_RANGES.system_distance.step}
                      className="w-full"
                    />
                    <Slider
                      id="system-distance"
                      value={systemDistance}
                      onValueChange={setSystemDistance}
                      max={1000}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Parameter Comparison */}
              {showComparison && (
                <Card className="p-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Parameter Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ParameterComparison />
                  </CardContent>
                </Card>
              )}

              {/* Advanced Inputs Toggle */}
              <div className="flex flex-wrap gap-2 pt-8 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Quality Inputs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparison(!showComparison)}
                  className="text-xs"
                >
                  {showComparison ? "Hide" : "Show"} Parameter Ranges
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetToDefaults} 
                  className="text-xs"
                >
                  ✨ Reset to Defaults
                </Button>
              </div>

              {/* Advanced Inputs */}
              {showAdvanced && (
                <Card className="mt-6">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-medium">Advanced Quality Inputs</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => {
                        // Prefill good-quality defaults
                        setPlSnr(35);
                        setKoiScore(0.9);
                        setFpFlagNt(0);
                        setFpFlagSs(0);
                        setFpFlagCo(0);
                        setFpFlagEc(0);
                        setPlImpact(0.5);
                        setStSlogg(4.4);
                        setPlEqt(800);
                        setPlInsol(100);
                        setTransitCount(3);
                      }} className="text-xs">★ Prefill good-quality defaults</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Row: SNR, koi_score, Not transit-like flag */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Transit Signal-to-Noise (SNR)<InfoHint text="Higher SNR generally indicates a clearer transit signal." /></Label>
                        <Input placeholder="e.g., 35" type="number" value={plSnr ?? ''} onChange={(e)=>setPlSnr(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Disposition Score (0-1)<InfoHint text="Disposition/confidence score from vetting systems (0 to 1)." /></Label>
                        <Input placeholder="e.g., 0.9" type="number" step="0.01" value={koiScore ?? ''} onChange={(e)=>setKoiScore(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Not Transit-Like Flag (0/1)<InfoHint text="1 indicates not-transit-like; 0 is transit-like." /></Label>
                        <Input placeholder="0 or 1" type="number" value={fpFlagNt ?? ''} onChange={(e)=>setFpFlagNt(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>

                      {/* Row: Stellar eclipse, Centroid offset, Ephemeris match */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Stellar Eclipse Flag (0/1)<InfoHint text="Flag if likely an eclipsing binary." /></Label>
                        <Input placeholder="0 or 1" type="number" value={fpFlagSs ?? ''} onChange={(e)=>setFpFlagSs(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Centroid Offset Flag (0/1)<InfoHint text="Flag if centroid offset suggests background object." /></Label>
                        <Input placeholder="0 or 1" type="number" value={fpFlagCo ?? ''} onChange={(e)=>setFpFlagCo(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Ephemeris Match Flag (0/1)<InfoHint text="Flag if event matches an ephemeris indicating false positive." /></Label>
                        <Input placeholder="0 or 1" type="number" value={fpFlagEc ?? ''} onChange={(e)=>setFpFlagEc(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>

                      {/* Row: Impact parameter, logg, eqt */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Impact Parameter<InfoHint text="Normalized transit impact parameter (0 at center, ~1 at limb)." /></Label>
                        <Input placeholder="e.g., 0.5" type="number" step="0.01" value={plImpact ?? ''} onChange={(e)=>setPlImpact(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Stellar log(g)<InfoHint text="Stellar surface gravity in log10(cm/s^2)." /></Label>
                        <Input placeholder="e.g., 4.4" type="number" step="0.01" value={stSlogg ?? ''} onChange={(e)=>setStSlogg(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Equilibrium Temperature (K)<InfoHint text="Estimated planet equilibrium temperature in Kelvin." /></Label>
                        <Input placeholder="e.g., 800" type="number" value={plEqt ?? ''} onChange={(e)=>setPlEqt(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>

                      {/* Row: Insolation, transits */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Insolation Flux (Earth flux)<InfoHint text="Stellar irradiance relative to Earth's." /></Label>
                        <Input placeholder="e.g., 100" type="number" value={plInsol ?? ''} onChange={(e)=>setPlInsol(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Number of Transits<InfoHint text="Count of observed transit events." /></Label>
                        <Input placeholder="e.g., 3" type="number" value={transitCount ?? ''} onChange={(e)=>setTransitCount(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Overall False-Positive Flag (0/1)<InfoHint text="Any false-positive flag triggered." /></Label>
                        <Input placeholder="0 or 1" type="number" value={fpFlagAny ?? ''} onChange={(e)=>setFpFlagAny(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>

                      {/* Additional optional metrics */}
                      <div>
                        <Label className="text-sm font-medium text-foreground">Semi-major Axis (AU)<InfoHint text="Orbital semi-major axis." /></Label>
                        <Input placeholder="optional" type="number" value={plOrbsmax ?? ''} onChange={(e)=>setPlOrbsmax(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Planet Density (g/cm³)<InfoHint text="Estimated bulk density." /></Label>
                        <Input placeholder="optional" type="number" value={plDensity ?? ''} onChange={(e)=>setPlDensity(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Depth Ratio<InfoHint text="Derived lightcurve depth ratio metric." /></Label>
                        <Input placeholder="optional" type="number" value={depthRatio ?? ''} onChange={(e)=>setDepthRatio(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">SNR Quality<InfoHint text="Quality score for SNR metric." /></Label>
                        <Input placeholder="optional" type="number" value={snrQuality ?? ''} onChange={(e)=>setSnrQuality(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Transit Signal<InfoHint text="Additional transit signal strength metric." /></Label>
                        <Input placeholder="optional" type="number" value={transitSignal ?? ''} onChange={(e)=>setTransitSignal(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Habitable Zone Ratio<InfoHint text="Distance relative to star's habitable zone." /></Label>
                        <Input placeholder="optional" type="number" value={hzRatio ?? ''} onChange={(e)=>setHzRatio(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-foreground">Stellar Mass Proxy<InfoHint text="Proxy for stellar mass used in model." /></Label>
                        <Input placeholder="optional" type="number" value={stMassProxy ?? ''} onChange={(e)=>setStMassProxy(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Classify Button */}
              <div className="flex justify-center pt-8">
                <Button
                  size="lg"
                  onClick={handleClassification}
                  disabled={isAnalyzing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-12 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : validationErrors.length > 0 ? (
                    <>
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Fix Validation Errors
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      Classify Exoplanet
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upload Error Display */}
              {uploadError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {/* File Upload Area */}
              <div 
                className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">
                  {csvFile ? `Selected: ${csvFile.name}` : 'Upload CSV File'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drop your file here or click to browse
                </p>
                <div className="text-xs text-muted-foreground">
                  Headers are flexible. Include any of: orbital_period/pl_orbper, planet_radius/pl_rade,
                  transit_depth/pl_trandep, transit_duration/pl_trandur, planet_mass/pl_bmasse,
                  stellar_temperature/st_teff, stellar_radius/st_rad, system_distance/sy_dist.
                </div>
                {csvFile && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">File ready for processing</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={handleBatchAnalysis}
                  disabled={!csvFile || isAnalyzing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-12 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Analyze Batch
                    </>
                  )}
                </Button>
              </div>

              {/* Batch File Details Panel */}
              {batchRows.length > 0 && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Batch File Details</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-muted-foreground">File:</span> <strong>{csvFile?.name}</strong></div>
                      <div><span className="text-muted-foreground">Uploaded:</span> <strong>{new Date().toLocaleString()}</strong></div>
                      <div><span className="text-muted-foreground">Total Rows:</span> <strong>{batchRows.length}</strong></div>
                      <div><span className="text-muted-foreground">Size:</span> <strong>{csvFile ? `${(csvFile.size/1024).toFixed(1)} KB` : '-'}</strong></div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Detected Columns</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(batchRows[0] || {}).slice(0, 24).map((c) => (
                          <span key={c} className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs border border-border">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Sample Data (First 3 Rows)</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="py-1 pr-2">#</th>
                              <th className="py-1 pr-2">Period</th>
                              <th className="py-1 pr-2">Radius</th>
                              <th className="py-1 pr-2">Class</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(batchResults.slice(0,3)).map((r, i) => (
                              <tr key={i} className="border-t border-border">
                                <td className="py-1 pr-2">{i+1}</td>
                                <td className="py-1 pr-2">{(batchRows[i]?.orbital_period ?? (batchRows[i] as any)?.pl_orbper) ?? '-'}</td>
                                <td className="py-1 pr-2">{(batchRows[i]?.planet_radius ?? (batchRows[i] as any)?.pl_rade) ?? '-'}</td>
                                <td className="py-1 pr-2">{r.planet_type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Planet Details Accordion */}
              {batchResults.length > 0 && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Planet Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {batchResults.map((r, i) => {
                      const row: any = batchRows[i] || {};
                      const name = row.pl_name || row.planet_name || `Planet ${i+1}`;
                      const koi = row.kepid || row.koi_name || 'N/A';
                      const [open, setOpen] = [undefined, undefined] as any; // placeholder to satisfy TS inline map
                      return (
                        <details key={i} className="rounded border border-border p-2 bg-card/60" open={false as any}>
                          <summary className="cursor-pointer flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">#{i+1}</span>
                              <span className="font-medium">{name}</span>
                            </div>
                            <span className="text-xs px-2 py-1 rounded bg-secondary border border-border">{r.planet_type} • {r.confidence.toFixed(1)}%</span>
                          </summary>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div><span className="text-muted-foreground">KOI ID:</span> <strong>{koi}</strong></div>
                            <div><span className="text-muted-foreground">Period:</span> <strong>{(row.orbital_period ?? row.pl_orbper) ?? '-'}</strong> d</div>
                            <div><span className="text-muted-foreground">Radius:</span> <strong>{(row.planet_radius ?? row.pl_rade) ?? '-'}</strong> R⊕</div>
                            <div><span className="text-muted-foreground">Transit Depth:</span> <strong>{(row.transit_depth ?? row.pl_trandep) ?? '-'}</strong> ppm</div>
                          </div>
                        </details>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
        
        {/* Right Column - 3D Visualization & Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-card rounded-3xl p-8 md:p-12 shadow-2xl border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl md:text-3xl font-light text-primary">
              {mode === 'batch' && batchResults.length > 0 ? 'Batch Results' : 'Exoplanet Analysis'}
            </h3>
            {((mode === 'single' && result) || (mode === 'batch' && batchResults.length > 0)) && (
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
          
          {/* Batch Results Distribution */}
          {mode === 'batch' && batchResults.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Classification Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <BatchDistributionChart results={batchResults} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {batchResults.slice(0, 10).map(result => (
                      <div key={result.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[result.planet_type as keyof typeof COLORS] || '#6b7280' }}
                          />
                          <span className="text-sm font-medium">#{result.id}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{result.planet_type}</div>
                          <div className="text-xs text-muted-foreground">{result.confidence.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Batch Visualizations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Planet Radius vs Orbital Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <PlanetScatterPlot rows={batchRows as any} results={batchResults as any} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Confidence Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConfidenceHeatmap results={batchResults as any} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Animated Results Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatedResultsFlow results={batchResults as any} />
                </CardContent>
              </Card>

              {batchRows.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Phase-Folded Transit (Example)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhaseFoldedTransit example={batchRows[0] as any} />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <>
              {/* 3D Visualization Container */}
              {(() => {
                // Derive live 3D properties from current inputs for an interactive feel
                const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
                const pr = planetRadius[0];
                const st = stellarTemp[0];
                const op = orbitalPeriod[0];
                const radius3d = clamp(1.0 + (clamp(pr, 0.3, 6) - 1.0) * 0.25, 0.7, 2.4);
                const hue = clamp(260 - ((clamp(st, 3000, 10000) - 3000) / 7000) * 200, 20, 260);
                const spin = clamp((365.25 / clamp(op, 1, 1000)), 0.2, 1.8);
                const ringBySize = pr >= 3;
                const ringByType = result ? ['Gas Giant','Hot Jupiter','Neptune-like'].includes(result.planet_type) : false;
                const showRing = ringByType || ringBySize;
                return (
                  <div className="relative w-full h-96 mb-8 rounded-2xl overflow-hidden border border-primary/20 bg-black">
                    <InteractivePlanet
                      planetType={result ? result.planet_type : 'default'}
                      radius={radius3d}
                      ring={showRing}
                      hue={hue}
                      rotateSpeed={spin}
                      className="rounded-2xl"
                    />
                  </div>
                );
              })()}
            </>
          )}

          {/* Results Panel for Single Mode */}
          {mode === 'single' && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h4 className="text-xl font-semibold text-primary mb-4">Classification Results</h4>
              
              {/* Enhanced Results Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Planet Type</span>
                  </div>
                  <p className="text-lg font-semibold" style={{ color: COLORS[result.planet_type as keyof typeof COLORS] || '#6b7280' }}>
                    {result.planet_type}
                  </p>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Confidence</span>
                    </div>
                    <ConfidenceGauge confidence={result.confidence} planetType={result.planet_type} />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Habitability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={result.habitability_score} className="flex-1" />
                    <span className="text-sm font-semibold">{result.habitability_score.toFixed(0)}%</span>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Size & Temp</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{result.size_category}</p>
                    <p className="text-xs text-muted-foreground">{result.temperature}K</p>
                  </div>
                </Card>
              </div>

              {/* Scientific Visualizations */}
              <div className="mt-6 space-y-8">
                <LightCurveGraph 
                  orbitalPeriod={orbitalPeriod[0]} 
                  transitDepth={transitDepth[0]} 
                  transitDuration={transitDuration[0]} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TransitGeometryDiagram stellarRadius={stellarRadius[0]} planetRadius={planetRadius[0]} />
                  <HabitableZoneViz stellarTemp={stellarTemp[0]} stellarRadius={stellarRadius[0]} orbitalPeriod={orbitalPeriod[0]} />
                </div>
                <RadialVelocityGraph orbitalPeriod={orbitalPeriod[0]} planetMass={planetMass[0]} />
                <StellarComparison stellarTemp={stellarTemp[0]} stellarRadius={stellarRadius[0]} />
              </div>
            </motion.div>
          )}
          
          {/* Recent Predictions History */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    Recent Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {history.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: COLORS[entry.result.planet_type as keyof typeof COLORS] || '#6b7280' }}
                          />
                          <span className="font-medium">{entry.result.planet_type}</span>
                        </div>
                        <div className="text-right">
                          <div>{entry.result.confidence.toFixed(0)}%</div>
                          <div className="text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          </motion.div>
        </div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-muted-foreground text-xs mt-6"
        >
          NASA Data • ML Classification • Open Source
        </motion.p>
      </div>
    </section>
  );
}
