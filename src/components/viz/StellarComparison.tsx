import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface Props {
  stellarTemp: number; // K
  stellarRadius: number; // R_sun
}

const StellarComparison: React.FC<Props> = ({ stellarTemp, stellarRadius }) => {
  const data = [
    { star: 'Your Star', temperature: stellarTemp, radius: stellarRadius, color: '#667eea' },
    { star: 'Sun', temperature: 5778, radius: 1.0, color: '#FFD700' },
    { star: 'Red Dwarf', temperature: 3500, radius: 0.5, color: '#FF6347' },
    { star: 'Hot Star', temperature: 7500, radius: 1.5, color: '#87CEEB' }
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">Host Star Comparison</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={{ width: '100%', height: 220 }}>
          <h5 className="text-sm font-medium mb-2">Temperature</h5>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <XAxis dataKey="star" angle={-25} textAnchor="end" height={50} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: 'K', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="temperature">
                {data.map((entry, index) => (
                  <Cell key={`t-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: '100%', height: 220 }}>
          <h5 className="text-sm font-medium mb-2">Radius</h5>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <XAxis dataKey="star" angle={-25} textAnchor="end" height={50} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: 'R☉', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="radius">
                {data.map((entry, index) => (
                  <Cell key={`r-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StellarComparison;