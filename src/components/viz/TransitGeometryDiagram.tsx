import React from "react";

interface Props {
  stellarRadius: number; // R_sun
  planetRadius: number; // R_earth
}

const TransitGeometryDiagram: React.FC<Props> = ({ stellarRadius, planetRadius }) => {
  const starSize = 100; // px reference radius
  const planetSize = Math.max(2, (planetRadius * 6371) / (Math.max(stellarRadius, 0.01) * 696000) * starSize);

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium">Transit Geometry</h4>
      <p className="text-xs text-muted-foreground">Relative sizes to scale (radius only)</p>
      <svg width="100%" height="220" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFA500" stopOpacity="0.6" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="110" r={starSize} fill="url(#starGrad)" />
        <line x1="40" y1="110" x2="360" y2="110" stroke="#666" strokeDasharray="5,5" strokeWidth="2" />
        <circle cx="120" cy="110" r={planetSize} fill="#4169E1" opacity="0.9" />
        <text x="200" y="210" textAnchor="middle" fill="#666" fontSize="10">
          Star (R = {stellarRadius.toFixed(2)} R☉)
        </text>
        <text x="120" y="90" textAnchor="middle" fill="#666" fontSize="10">
          Planet (R = {planetRadius.toFixed(2)} R⊕)
        </text>
      </svg>
      <p className="text-xs"><strong>Size ratio:</strong> {(planetSize / starSize * 100).toFixed(2)}% of stellar radius</p>
    </div>
  );
};

export default TransitGeometryDiagram;