import React from "react";

interface Props {
  stellarTemp: number; // K
  stellarRadius: number; // R_sun
  orbitalPeriod: number; // days
}

const HabitableZoneViz: React.FC<Props> = ({ stellarTemp, stellarRadius, orbitalPeriod }) => {
  const luminosity = Math.pow(stellarRadius, 2) * Math.pow(stellarTemp / 5778, 4);
  const innerEdge = Math.sqrt(luminosity / 1.1);
  const outerEdge = Math.sqrt(luminosity / 0.53);
  const planetAU = Math.pow(orbitalPeriod / 365.25, 2 / 3);
  const inHZ = planetAU >= innerEdge && planetAU <= outerEdge;

  const xScale = (au: number) => 60 + au * 120; // px mapping

  return (
    <div className="space-y-2">
      <h4 className="text-lg font-medium">Habitable Zone</h4>
      <p className="text-xs text-muted-foreground">Planet orbit vs the system's temperate zone</p>
      <svg width="100%" height="160" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid meet">
        <circle cx="60" cy="80" r="16" fill="#FFD700" />
        {/* HZ band */}
        <rect x={xScale(innerEdge)} y={50} width={Math.max(0, xScale(outerEdge) - xScale(innerEdge))} height={60} fill="#90EE90" opacity={0.35} />
        {/* Planet position */}
        <circle cx={xScale(planetAU)} cy={80} r={8} fill={inHZ ? "#22c55e" : "#4169E1"} />
        {/* Labels */}
        <text x="60" y="105" textAnchor="middle" fontSize="10">Star</text>
        <text x={(xScale(innerEdge) + xScale(outerEdge)) / 2} y={120} textAnchor="middle" fontSize="10" fill="#166534">Habitable Zone</text>
      </svg>
      <div className="text-xs">
        <p><strong>Planet distance:</strong> {planetAU.toFixed(3)} AU {inHZ ? '✓ In HZ' : 'Outside HZ'}</p>
        <p><strong>HZ:</strong> {innerEdge.toFixed(3)} - {outerEdge.toFixed(3)} AU</p>
      </div>
    </div>
  );
};

export default HabitableZoneViz;