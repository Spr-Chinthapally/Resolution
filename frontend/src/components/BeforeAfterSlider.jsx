import React, { useRef, useState, useCallback, useEffect } from "react";

export const BeforeAfterSlider = ({ originalSrc, enhancedSrc, zoom = 1 }) => {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const draggingRef = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    setPos((x / rect.width) * 100);
  }, []);

  useEffect(() => {
    const move = (e) => {
      if (!draggingRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(clientX);
    };
    const up = () => (draggingRef.current = false);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [setFromClientX]);

  const scaleStyle = { transform: `scale(${zoom})`, transformOrigin: "center center" };

  return (
    <div
      className="relative w-full overflow-auto rounded-xl border border-slate-200 bg-slate-900"
      style={{ maxHeight: 540 }}
      data-testid="before-after-slider"
    >
      <div
        ref={containerRef}
        className="relative mx-auto select-none"
        style={{ width: "100%", aspectRatio: "16 / 9", cursor: "ew-resize" }}
        onMouseDown={(e) => {
          draggingRef.current = true;
          setFromClientX(e.clientX);
        }}
        onTouchStart={(e) => {
          draggingRef.current = true;
          setFromClientX(e.touches[0].clientX);
        }}
      >
        {/* Enhanced (bottom layer) */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-900">
          <img src={enhancedSrc} alt="Enhanced" className="max-w-full max-h-full object-contain" style={scaleStyle} draggable={false} />
        </div>
        {/* Original (top layer, clipped) */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-900"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img src={originalSrc} alt="Original" className="max-w-full max-h-full object-contain" style={scaleStyle} draggable={false} />
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 text-xs font-mono uppercase tracking-widest text-white bg-black/50 rounded px-2 py-1 pointer-events-none">
          Original
        </span>
        <span className="absolute top-3 right-3 text-xs font-mono uppercase tracking-widest text-white bg-sky-600/80 rounded px-2 py-1 pointer-events-none">
          Enhanced
        </span>

        {/* Handle */}
        <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
          <div className="w-0.5 h-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <span className="text-slate-400 text-xs">◀</span>
              <span className="text-slate-400 text-xs">▶</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
