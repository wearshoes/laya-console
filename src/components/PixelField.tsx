"use client";

import { useEffect, useRef } from "react";

function hash(x: number, y: number) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export function PixelField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const draw = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cell = 8;
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const ny = y / Math.max(1, rows - 1);
          const density = Math.pow(Math.max(0, (ny - 0.34) / 0.66), 1.35);
          const n = hash(x + 3, y + 11);
          if (n > density * 0.92) continue;
          const bright = hash(x + 19, y + 5);
          const alpha = (0.18 + bright * 0.82) * (0.2 + density);
          const size = bright > 0.86 ? 4 : bright > 0.55 ? 3 : 2;
          const shade = Math.floor(168 + bright * 87);
          ctx.fillStyle = `rgba(${shade},${shade},${shade},${alpha})`;
          ctx.fillRect(x * cell + 1, y * cell + 1, size, size);
        }
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
