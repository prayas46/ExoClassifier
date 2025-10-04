import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Rocket, BarChart3, Globe, Star, Zap } from "lucide-react";

type AnalysisMode = "single" | "batch";

interface ClassificationResult {
  planet_type: string;
  confidence: number;
  habitability_score: number;
  size_category: string;
  temperature: number;
}

export default function Classifier() {
  const [mode, setMode] = useState<AnalysisMode>("single");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  
  // Parameter states
  const [orbitalPeriod, setOrbitalPeriod] = useState([365.25]);
  const [planetRadius, setPlanetRadius] = useState([1.0]);
  const [transitDepth, setTransitDepth] = useState([1000]);
  const [transitDuration, setTransitDuration] = useState([3.5]);
  const [planetMass, setPlanetMass] = useState([1.0]);
  const [stellarTemp, setStellarTemp] = useState([5778]);
  const [stellarRadius, setStellarRadius] = useState([1.0]);
  const [systemDistance, setSystemDistance] = useState([200]);

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

  const handleClassification = () => {
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
    
    // Simulate API call with mock result
    setTimeout(() => {
      const mockResult: ClassificationResult = {
        planet_type: planetRadius[0] > 2 ? "Gas Giant" : planetRadius[0] > 1.5 ? "Super-Earth" : "Earth-like",
        confidence: 85 + Math.random() * 10,
        habitability_score: stellarTemp[0] > 4000 && stellarTemp[0] < 7000 ? 70 + Math.random() * 25 : 20 + Math.random() * 40,
        size_category: planetRadius[0] > 4 ? "Jupiter-sized" : planetRadius[0] > 2 ? "Neptune-sized" : planetRadius[0] > 1.25 ? "Super-Earth" : "Earth-sized",
        temperature: Math.round(stellarTemp[0] * Math.pow(stellarRadius[0] / (orbitalPeriod[0] / 365.25), 0.5))
      };
      setResult(mockResult);
      setIsAnalyzing(false);
    }, 2000);
    
    console.log('Classifying exoplanet with data:', planetData);
  };

  return (
    <section id="classifier" className="relative w-full py-20 px-4 bg-background">
      <div className="container mx-auto w-full">
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
              {/* Row 1: Orbital Period, Planet Radius */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="orbital-period" className="flex items-center gap-2 text-base font-medium">
                    Orbital Period (days): {orbitalPeriod[0].toFixed(2)}
                  </Label>
                  <Slider
                    id="orbital-period"
                    value={orbitalPeriod}
                    onValueChange={setOrbitalPeriod}
                    max={1000}
                    min={0.5}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="planet-radius" className="flex items-center gap-2 text-base font-medium">
                    Planet Radius (Earth radii): {planetRadius[0].toFixed(2)}
                  </Label>
                  <Slider
                    id="planet-radius"
                    value={planetRadius}
                    onValueChange={setPlanetRadius}
                    max={10}
                    min={0.1}
                    step={0.01}
                    className="w-full"
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

              {/* Advanced Inputs Toggle */}
              <div className="flex flex-wrap gap-4 pt-8 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Quality Inputs
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetToDefaults} 
                  className="text-sm px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                >
                  ✨ Prefill good-quality defaults
                </Button>
              </div>

              {/* Classify Button */}
              <div className="flex justify-center pt-8">
                <Button
                  size="lg"
                  onClick={handleClassification}
                  disabled={isAnalyzing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-12 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Analyzing...
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
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">Upload CSV File</h3>
                <p className="text-muted-foreground mb-4">
                  Drop your file here or click to browse
                </p>
                <Button variant="outline">Select File</Button>
              </div>
              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-12 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Analyze Batch
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
            <h3 className="text-2xl md:text-3xl font-light text-primary mb-6">
              3D Exoplanet Model
            </h3>
            
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
              
              {/* Loading overlay */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl"
                >
                  <div className="text-center text-white">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p>Generating 3D model...</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Results Panel */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <h4 className="text-xl font-semibold text-primary mb-4">Classification Results</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Planet Type</span>
                    </div>
                    <p className="text-lg font-semibold">{result.planet_type}</p>
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Confidence</span>
                    </div>
                    <p className="text-lg font-semibold">{result.confidence.toFixed(1)}%</p>
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Habitability</span>
                    </div>
                    <p className="text-lg font-semibold">{result.habitability_score.toFixed(0)}%</p>
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Size</span>
                    </div>
                    <p className="text-lg font-semibold">{result.size_category}</p>
                  </div>
                </div>
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
