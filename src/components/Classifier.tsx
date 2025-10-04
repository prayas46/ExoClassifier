import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Parse CSV content
  const parseCsvContent = (content: string): Record<string, any>[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row.');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredColumns = ['orbital_period', 'planet_radius', 'transit_depth', 'transit_duration', 
                           'planet_mass', 'stellar_temperature', 'stellar_radius', 'system_distance'];
    
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, any> = { id: index + 1 };
      
      headers.forEach((header, i) => {
        if (requiredColumns.includes(header)) {
          const value = parseFloat(values[i]);
          if (isNaN(value)) {
            throw new Error(`Invalid numeric value in row ${index + 2}, column '${header}': ${values[i]}`);
          }
          row[header] = value;
        }
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
  const handleClassification = () => {
    if (!validateParameters()) {
      toast({
        title: "Validation Error",
        description: "Please fix the parameter validation errors before continuing.",
        variant: "destructive"
      });
      return;
    }

    const planetData = {
      orbital_period: orbitalPeriod[0],
      planet_radius: planetRadius[0],
      transit_depth: transitDepth[0],
      transit_duration: transitDuration[0],
      planet_mass: planetMass[0],
      stellar_temperature: stellarTemp[0],
      stellar_radius: stellarRadius[0],
      system_distance: systemDistance[0]
    };
    
    setIsAnalyzing(true);
    console.log('Classifying exoplanet with data:', planetData);
    
    // Simulate API call with enhanced mock result
    setTimeout(() => {
      const mockResult: ClassificationResult = {
        planet_type: planetRadius[0] > 4 ? "Gas Giant" : 
                    planetRadius[0] > 2 ? "Neptune-like" : 
                    planetRadius[0] > 1.5 ? "Super-Earth" : "Earth-like",
        confidence: 85 + Math.random() * 10,
        habitability_score: stellarTemp[0] > 4000 && stellarTemp[0] < 7000 && 
                           orbitalPeriod[0] > 200 && orbitalPeriod[0] < 600 ? 
                           70 + Math.random() * 25 : 20 + Math.random() * 40,
        size_category: planetRadius[0] > 4 ? "Jupiter-sized" : 
                      planetRadius[0] > 2 ? "Neptune-sized" : 
                      planetRadius[0] > 1.25 ? "Super-Earth" : "Earth-sized",
        temperature: Math.round(stellarTemp[0] * Math.pow(stellarRadius[0] / Math.sqrt(orbitalPeriod[0] / 365.25), 0.5))
      };
      
      setResult(mockResult);
      addToHistory(planetData, mockResult);
      setIsAnalyzing(false);
      
      toast({
        title: "Classification Complete",
        description: `Planet classified as ${mockResult.planet_type} with ${mockResult.confidence.toFixed(1)}% confidence.`
      });
    }, 2000);
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

    try {
      const content = await csvFile.text();
      console.log('CSV content loaded, parsing...');
      
      const data = parseCsvContent(content);
      console.log('Parsed CSV data:', data);
      setBatchRows(data);
      
      // Simulate processing delay
      setTimeout(() => {
        const results: BatchResult[] = data.map((row, index) => ({
          id: row.id,
          timestamp: new Date().toISOString(),
          planet_type: row.planet_radius > 4 ? "Gas Giant" : 
                      row.planet_radius > 2 ? "Neptune-like" : 
                      row.planet_radius > 1.5 ? "Super-Earth" : "Earth-like",
          confidence: 80 + Math.random() * 15,
          habitability_score: row.stellar_temperature > 4000 && row.stellar_temperature < 7000 && 
                             row.orbital_period > 200 && row.orbital_period < 600 ? 
                             60 + Math.random() * 30 : 15 + Math.random() * 40,
          size_category: row.planet_radius > 4 ? "Jupiter-sized" : 
                        row.planet_radius > 2 ? "Neptune-sized" : 
                        row.planet_radius > 1.25 ? "Super-Earth" : "Earth-sized",
          temperature: Math.round(row.stellar_temperature * Math.pow(row.stellar_radius / Math.sqrt(row.orbital_period / 365.25), 0.5))
        }));
        
        setBatchResults(results);
        setIsAnalyzing(false);
        
        toast({
          title: "Batch Analysis Complete",
          description: `Successfully classified ${results.length} exoplanets.`
        });
        
        console.log('Batch analysis results:', results);
      }, 3000);
      
    } catch (error: any) {
      console.error('Batch analysis error:', error);
      setUploadError(error.message);
      setIsAnalyzing(false);
      
      toast({
        title: "Batch Analysis Error",
        description: error.message,
        variant: "destructive"
      });
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
                {mode === 'batch' ? 'Processing your CSV file...' : 'Running classification model...'}
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
            <h2 className="text-3xl md:text-4xl font-light text-primary mb-4">
              {mode === "single" ? "Single Planet Analysis" : "Batch Analysis"}
            </h2>
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
                <div className="space-y-4">
                  <Label htmlFor="planet-radius" className={`flex items-center gap-2 text-base font-medium ${
                    validationErrors.some(e => e.parameter === 'planet_radius') ? 'text-red-500' : ''
                  }`}>
                    Planet Radius (Earth radii): {planetRadius[0].toFixed(2)}
                    {validationErrors.some(e => e.parameter === 'planet_radius') && 
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    }
                  </Label>
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

              {/* Row 2: Transit Depth, Transit Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="transit-depth" className="flex items-center gap-2 text-base font-medium">
                    Transit Depth (ppm): {transitDepth[0].toFixed(0)}
                  </Label>
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

                <div className="space-y-4">
                  <Label htmlFor="transit-duration" className="flex items-center gap-2 text-base font-medium">
                    Transit Duration (hours): {transitDuration[0].toFixed(1)}
                  </Label>
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

              {/* Row 3: Planet Mass, Stellar Temperature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="planet-mass" className="flex items-center gap-2 text-base font-medium">
                    Planet Mass (Earth masses): {planetMass[0].toFixed(2)}
                  </Label>
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
                <div className="space-y-4">
                  <Label htmlFor="stellar-temp" className="flex items-center gap-2 text-base font-medium">
                    Stellar Temperature (K): {stellarTemp[0].toFixed(0)}
                  </Label>
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

              {/* Row 4: Stellar Radius, System Distance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="stellar-radius" className="flex items-center gap-2 text-base font-medium">
                    Stellar Radius (Solar radii): {stellarRadius[0].toFixed(2)}
                  </Label>
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
                <div className="space-y-4">
                  <Label htmlFor="system-distance" className="flex items-center gap-2 text-base font-medium">
                    System Distance (pc): {systemDistance[0].toFixed(0)}
                  </Label>
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

              {/* Classify Button */}
              <div className="flex justify-center pt-8">
                <Button
                  size="lg"
                  onClick={handleClassification}
                  disabled={isAnalyzing || validationErrors.length > 0}
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
                  Required columns: orbital_period, planet_radius, transit_depth, transit_duration, 
                  planet_mass, stellar_temperature, stellar_radius, system_distance
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
              {mode === 'batch' && batchResults.length > 0 ? 'Batch Results' : '3D Exoplanet Model'}
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
              <div className="relative w-full h-64 mb-8 bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl overflow-hidden border border-primary/20">
                <iframe 
                  src='https://my.spline.design/worldplanet-ACy9j4dwrbm6RTBiCz8JGpFz/' 
                  frameBorder='0' 
                  width='100%' 
                  height='100%'
                  className="rounded-2xl"
                  title="3D Exoplanet Model"
                />
              </div>
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
