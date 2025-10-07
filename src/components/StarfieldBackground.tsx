import React, { useEffect, useRef } from 'react';

export default function StarfieldBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const starsRef = useRef<Array<{ x: number; y: number; s: number; v: number; o: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(DPR, DPR);
      // regenerate stars proportional to area
      const count = Math.min(1200, Math.floor((w * h) / 2500)); // ~0.4 stars per 1k px
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: Math.random() * 1.2 + 0.2, // size 0.2..1.4
        v: Math.random() * 0.15 + 0.03, // velocity
        o: Math.random() * 0.6 + 0.2, // opacity 0.2..0.8
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // background fade to pure black to avoid seams between sections
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // draw stars with subtle parallax-like drift
      for (const star of starsRef.current) {
        star.y += star.v; // slow fall
        if (star.y > h + 2) {
          star.y = -2;
          star.x = Math.random() * w;
        }
        // gentle twinkle
        const tw = 0.6 + Math.sin((star.x + star.y) * 0.002) * 0.4;
        ctx.globalAlpha = Math.min(1, Math.max(0.1, star.o * tw));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(star.x, star.y, star.s, star.s);
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      aria-hidden="true"
    />
  );
}
