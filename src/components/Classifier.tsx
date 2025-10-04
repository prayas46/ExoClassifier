import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Rocket, BarChart3 } from "lucide-react";

type AnalysisMode = "single" | "batch";

export default function Classifier() {
  const [mode, setMode] = useState<AnalysisMode>("single");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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
    
    console.log('Classifying exoplanet with data:', planetData);
    // Here you would typically send the data to your API
  };

  return (
    <section className="relative w-full py-20 px-4">
      <div className="container mx-auto max-w-6xl">
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

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
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
            <div className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="orbital-period" className="flex items-center gap-2">
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
                <div className="space-y-3">
                  <Label htmlFor="planet-radius" className="flex items-center gap-2">
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
                <div className="space-y-3">
                  <Label htmlFor="transit-depth" className="flex items-center gap-2">
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
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="transit-duration" className="flex items-center gap-2">
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
                <div className="space-y-3">
                  <Label htmlFor="planet-mass" className="flex items-center gap-2">
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
                <div className="space-y-3">
                  <Label htmlFor="stellar-temp" className="flex items-center gap-2">
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

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="stellar-radius" className="flex items-center gap-2">
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
                <div className="space-y-3">
                  <Label htmlFor="system-distance" className="flex items-center gap-2">
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
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Quality Inputs
                </Button>
                <Button variant="outline" onClick={resetToDefaults} className="text-sm">
                  ✨ Prefill good-quality defaults
                </Button>
              </div>

              {/* Classify Button */}
              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  onClick={handleClassification}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-12 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Classify Exoplanet
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

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-muted-foreground text-sm mt-8"
        >
          Built with NASA exoplanet data • RandomForest ML model • React + FastAPI
        </motion.p>
      </div>
    </section>
  );
}
