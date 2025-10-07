import React, { useMemo } from 'react';

export default function SplineEarth({ url, className = '' }: { url: string; className?: string }) {
  // If the URL is a my.spline.design share link, we should use an iframe.
  // The <spline-viewer> element expects a direct .splinecode URL (prod.spline.design/.../scene.splinecode).
  const isSplineCode = useMemo(() => /\.splinecode(\?|$)/.test(url), [url]);

  return (
    <div className={`w-full h-full ${className}`}>
      {isSplineCode ? (
        <spline-viewer
          url={url}
          style={{ width: '100%', height: '100%', pointerEvents: 'none', background: 'transparent' }}
        />
      ) : (
        <iframe
          src={url}
          title="Spline Earth"
          style={{ width: '100%', height: '100%', border: '0', background: 'transparent', pointerEvents: 'none' }}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      )}
    </div>
  );
}
