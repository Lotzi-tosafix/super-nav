import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreAisle, Product } from '../types';
import { MapPin, Info, Compass, HelpCircle } from 'lucide-react';

interface InteractiveMapProps {
  aisles: StoreAisle[];
  products: Product[];
  selectedProduct: Product | null;
  optimizedRoute: any[] | null;
  currentStepIndex: number;
  userPos: { x: number; y: number };
  setUserPos: (pos: { x: number; y: number }) => void;
}

export default function InteractiveMap({
  aisles,
  products,
  selectedProduct,
  optimizedRoute,
  currentStepIndex,
  userPos,
  setUserPos,
}: InteractiveMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredAisle, setHoveredAisle] = useState<StoreAisle | null>(null);

  // Map limits: Grid x (0 - 12), Grid y (0 - 8).
  // We map these coordinates to SVG dimensions of 900x600 pixels.
  const mapWidth = 900;
  const mapHeight = 550;

  const toPxX = (gridX: number) => (gridX / 12) * mapWidth;
  const toPxY = (gridY: number) => (gridY / 8) * mapHeight;

  // Find simulated location of product on the map
  const getProductCoords = (product: Product) => {
    const aisle = aisles.find((a) => a.id === product.aisleId);
    if (!aisle) return { x: 0, y: 0 };

    // Calculate exact visual shelf offset based on shelf position inside the aisle box
    // If layout is vertical, shelf position (horizontal split) varies slightly inside item's x range,
    // and shelf level (vertical split) varies slightly inside item's y range.
    const isVertical = aisle.height > aisle.width;

    if (isVertical) {
      // Along the width (x position)
      const xFactor = 0.2 + (product.shelfPosition / 6) * 0.6; // center 60%
      const yFactor = 0.15 + (product.shelfLevel / (aisle.shelvesCount + 1)) * 0.7; // distribute vertical
      return {
        x: toPxX(aisle.x + aisle.width * xFactor),
        y: toPxY(aisle.y + aisle.height * yFactor),
      };
    } else {
      // Horizontal aisles (like refrigerators, freezers)
      const xFactor = 0.1 + (product.shelfPosition / 6) * 0.8;
      const yFactor = 0.3 + (product.shelfLevel / (aisle.shelvesCount + 1)) * 0.4;
      return {
        x: toPxX(aisle.x + aisle.width * xFactor),
        y: toPxY(aisle.y + aisle.height * yFactor),
      };
    }
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixel coordinates back to grid coordinates (0-12, 0-8)
    const gridX = (clickX / rect.width) * 12;
    const gridY = (clickY / rect.height) * 8;

    setUserPos({
      x: Number(gridX.toFixed(2)),
      y: Number(gridY.toFixed(2)),
    });
  };

  const activeProductCoords = selectedProduct ? getProductCoords(selectedProduct) : null;

  // Let's create path string for Waze line simulation
  let pathD = '';
  if (optimizedRoute && optimizedRoute.length > 0) {
    // Gather all points: User Position first, then target locations along optimization chain, then exit if needed
    const points = [
      { x: toPxX(userPos.x), y: toPxY(userPos.y) },
      ...optimizedRoute.map((step) => {
        // Find product or aisle coordinates
        if (step.productId) {
          const prod = products.find((p) => p.id === step.productId);
          if (prod) return getProductCoords(prod);
        }
        return { x: toPxX(step.x), y: toPxY(step.y) };
      }),
    ];

    // If step index is active, we can highlight the remaining path or draw the full path
    pathD = `M ${points[0].x} ${points[0].y} `;
    for (let i = 1; i < points.length; i++) {
      // Create curvy segments for organic visual paths instead of rough jagged lines
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      const cpY = (prev.y + curr.y) / 2;
      pathD += `Q ${prev.x} ${curr.y}, ${curr.x} ${curr.y} `; // using quadratic curves
    }
  } else if (activeProductCoords) {
    // Just draw a line from users dot to the selected product!
    const startX = toPxX(userPos.x);
    const startY = toPxY(userPos.y);
    const endX = activeProductCoords.x;
    const endY = activeProductCoords.y;
    // Walk paths avoiding obstacles (simple 2-segment path around grid layout)
    pathD = `M ${startX} ${startY} Q ${startX} ${endY}, ${endX} ${endY}`;
  }

  // Find products associated with the hovered aisle
  const getHoveredAisleProducts = () => {
    if (!hoveredAisle) return [];
    return products.filter((p) => p.aisleId === hoveredAisle.id);
  };

  return (
    <div id="interactive-map-container" className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Top controls and legend */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-slate-100">סימולטור מפת הסופרמרקט</h3>
            <p className="text-xs text-slate-400">הקלק על המפה כדי למקם את עצמך מחדש בתוך החנות</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-ping" />
            <span>המיקום שלך (קליק לשינוי)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-500">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span>מוצר מבוקש</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-5 h-1 border-t-2 border-dashed border-emerald-500" />
            <span>נתיב Waze אופטימלי</span>
          </div>
        </div>
      </div>

      {/* Main Map Visual panel */}
      <div className="relative flex-1 bg-slate-900/40 p-4 flex items-center justify-center overflow-auto min-h-[420px]">
        {/* Instruction badge popup */}
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl text-xs text-slate-300 border border-slate-800 pointer-events-none flex items-center gap-2 max-w-xs z-10">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <b>טיפ טכני:</b> מערכת ה-GIS משתמשת בתשתית וקטורית (SVG). הזזת מידע מוצרים או קואורדינטות פלנוגרמה תעדכן מיידית את המפה לצרכן!
          </span>
        </div>

        {/* Floating current location coordinate details */}
        <div className="absolute right-4 top-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-slate-400 border border-slate-800 font-mono flex flex-col pointer-events-none z-10 select-none">
          <span>X: {userPos.x.toFixed(1)} | Y: {userPos.y.toFixed(1)}</span>
          <span className="text-blue-400 text-[10px]">לחץ על המפה לקיבוע מיקומך בסימולציה</span>
        </div>

        <svg
          id="supermarket-svg-map"
          ref={svgRef}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full max-w-4xl aspect-[18/11] bg-slate-950/60 rounded-2xl border border-slate-800/80 cursor-crosshair relative shadow-inner select-none overflow-hidden"
          onClick={handleMapClick}
        >
          {/* Subtle grid pattern for space alignment */}
          <defs>
            <pattern id="gridPattern" width="45" height="45" patternUnits="userSpaceOnUse">
              <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(51, 65, 85, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Boundaries / Perimeter Walls */}
          <rect x="5" y="5" width={mapWidth - 10} height={mapHeight - 10} fill="none" stroke="rgba(71, 85, 105, 0.3)" strokeWidth="4" rx="12" />

          {/* Entrance and Checkout static nodes */}
          <g>
            {/* Entrance (bottom-right area) */}
            <rect x={toPxX(11)} y={toPxY(6)} width={toPxX(0.8)} height={toPxY(1.5)} fill="rgba(16, 185, 129, 0.08)" rx="4" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" />
            <text x={toPxX(11.4)} y={toPxY(7)} fill="#10b981" fontSize="11" fontFamily="system-ui" fontWeight="semibold" textAnchor="middle">כניסה</text>
            <circle cx={toPxX(11.4)} cy={toPxY(6.7)} r="4" fill="#10b981" className="animate-ping" />

            {/* Checkout (bottom-left area) */}
            <rect x={toPxX(0.5)} y={toPxY(6)} width={toPxX(1.4)} height={toPxY(1.5)} fill="rgba(239, 68, 68, 0.08)" rx="4" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1.5" />
            <text x={toPxX(1.2)} y={toPxY(7)} fill="#ef4444" fontSize="11" fontFamily="system-ui" fontWeight="semibold" textAnchor="middle">קופות תשלום</text>
            <circle cx={toPxX(1.2)} cy={toPxY(6.7)} r="4" fill="#ef4444" />
          </g>

          {/* Render Aisles */}
          {aisles.map((aisle) => {
            const pxX = toPxX(aisle.x);
            const pxY = toPxY(aisle.y);
            const pxW = toPxX(aisle.width);
            const pxH = toPxY(aisle.height);

            const isAisleSelected = selectedProduct && selectedProduct.aisleId === aisle.id;
            const isAisleOnOptimizedRoute = optimizedRoute && optimizedRoute.some(step => step.aisleId === aisle.id);
            const isHovered = hoveredAisle && hoveredAisle.id === aisle.id;

            return (
              <g
                key={aisle.id}
                onMouseEnter={() => setHoveredAisle(aisle)}
                onMouseLeave={() => setHoveredAisle(null)}
                className="transition-all duration-300"
              >
                {/* Visual Glow behind active/selected Aisle */}
                {(isAisleSelected || isHovered) && (
                  <rect
                    x={pxX - 6}
                    y={pxY - 6}
                    width={pxW + 12}
                    height={pxH + 12}
                    fill="none"
                    stroke={isAisleSelected ? "rgba(239, 68, 68, 0.25)" : "rgba(99, 102, 241, 0.15)"}
                    strokeWidth="10"
                    rx="12"
                    className="blur-md"
                  />
                )}

                {/* Main Aisle Rect */}
                <rect
                  x={pxX}
                  y={pxY}
                  width={pxW}
                  height={pxH}
                  fill={isAisleSelected ? "#1e1b1b" : isAisleOnOptimizedRoute ? "#0f171b" : "#0f172a"}
                  stroke={isAisleSelected ? "#ef4444" : isHovered ? "#6366f1" : isAisleOnOptimizedRoute ? "#059669" : "rgba(51, 65, 85, 0.7)"}
                  strokeWidth={isAisleSelected || isHovered || isAisleOnOptimizedRoute ? "2.5" : "1.5"}
                  rx="6"
                  className="transition-all duration-300 cursor-help"
                />

                {/* Inner shelves detailing representation lines */}
                {Array.from({ length: Math.min(aisle.shelvesCount, 4) }).map((_, i) => {
                  const shelfOffset = (pxH / (Math.min(aisle.shelvesCount, 4) + 1)) * (i + 1);
                  const isVertical = pxH > pxW;
                  return (
                    <line
                      key={i}
                      x1={isVertical ? pxX + 4 : pxX + shelfOffset}
                      y1={isVertical ? pxY + shelfOffset : pxY + 4}
                      x2={isVertical ? pxX + pxW - 4 : pxX + shelfOffset}
                      y2={isVertical ? pxY + shelfOffset : pxY + pxH - 4}
                      stroke="rgba(71, 85, 105, 0.15)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Aisle Text Label */}
                <g transform={`translate(${pxX + pxW / 2}, ${pxY + pxH / 2})`}>
                  {pxH > pxW ? (
                    // Vertical text representation for vertical aisles so text fits beautifully
                    <g transform="rotate(0)">
                      <rect x="-15" y="-30" width="30" height="60" fill="#020617" rx="4" stroke="rgba(71, 85, 105, 0.3)" strokeWidth="1" />
                      <text x="0" y="-8" fill="#cbd5e1" fontSize="12" fontFamily="system-ui" fontWeight="bold" textAnchor="middle">
                        טור
                      </text>
                      <text x="0" y="14" fill="#a7f3d0" fontSize="18" fontFamily="system-ui" fontWeight="extrabold" textAnchor="middle">
                        {aisle.number}
                      </text>
                    </g>
                  ) : (
                    // Horizontal labels for freezer / dairy
                    <g>
                      <rect x="-50" y="-12" width="100" height="24" fill="#020617" rx="4" stroke="rgba(71, 85, 105, 0.3)" strokeWidth="1" />
                      <text x="0" y="5" fill="#cbd5e1" fontSize="11" fontFamily="system-ui" fontWeight="bold" textAnchor="middle">
                        {aisle.name.split(' - ')[0]}
                      </text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}

          {/* Render glowing route path (The Waze wire!) */}
          {pathD && (
            <g>
              {/* Backglow line */}
              <path
                d={pathD}
                fill="none"
                stroke={optimizedRoute ? "#10b981" : "#10b981"}
                strokeWidth="8"
                strokeLinecap="round"
                className="opacity-20 blur-sm pointer-events-none"
              />
              {/* Main vector line */}
              <path
                d={pathD}
                fill="none"
                stroke={optimizedRoute ? "#10b981" : "#10b981"}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={optimizedRoute ? "12 8" : "8, 6"}
                className={optimizedRoute ? "animate-route-flow" : "animate-route-flow-slow"}
                style={optimizedRoute ? { animation: 'dash 30s linear infinite' } : {}}
              />
            </g>
          )}

          {/* Render individual points of interest in optimized route */}
          {optimizedRoute && (
            <g>
              {optimizedRoute.map((step, idx) => {
                const stepX = step.productId ? getProductCoords(products.find(p => p.id === step.productId)!).x : toPxX(step.x);
                const stepY = step.productId ? getProductCoords(products.find(p => p.id === step.productId)!).y : toPxY(step.y);

                const isActiveStep = idx === currentStepIndex;

                return (
                  <g key={idx}>
                    {/* Glowing point marker */}
                    <circle
                      cx={stepX}
                      cy={stepY}
                      r={isActiveStep ? "14" : "10"}
                      fill={isActiveStep ? "rgba(16, 185, 129, 0.2)" : "rgba(2, 6, 23, 0.9)"}
                      stroke={isActiveStep ? "#10b981" : "#34d399"}
                      strokeWidth={isActiveStep ? "3" : "2"}
                      className="transition-all duration-300"
                    />
                    {/* Label index */}
                    <text
                      x={stepX}
                      y={stepY + 4}
                      fill={isActiveStep ? "#ffffff" : "#34d399"}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Selected product glowing locator pin */}
          {selectedProduct && activeProductCoords && (
            <g transform={`translate(${activeProductCoords.x}, ${activeProductCoords.y})`}>
              {/* Animated outer pulsing rings */}
              <circle cx="0" cy="0" r="28" fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping opacity-25" />
              <circle cx="0" cy="0" r="16" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="2" className="animate-pulse" />
              {/* Direct Pin drop marker */}
              <path d="M 0 0 C -5 -10, -8 -15, -8 -22 C -8 -28, -4 -32, 0 -32 C 4 -32, 8 -28, 8 -22 C 8 -15, 5 -10, 0 0" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
              {/* Inner dot */}
              <circle cx="0" cy="-22" r="3.5" fill="#ffffff" />
            </g>
          )}

          {/* User simulation Blue Avatar point */}
          <g transform={`translate(${toPxX(userPos.x)}, ${toPxY(userPos.y)})`}>
            {/* Wave dynamic pulses */}
            <circle cx="0" cy="0" r="18" fill="none" stroke="#3b82f6" strokeWidth="1" className="animate-ping opacity-40 pointer-events-none" />
            <circle cx="0" cy="0" r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" className="shadow-[0_0_12px_rgba(59,130,246,0.8)] cursor-grab" />
          </g>
        </svg>
      </div>

      {/* Hover Information / Quick Drawer */}
      <AnimatePresence mode="wait">
        {hoveredAisle ? (
          <motion.div
            key="aisle-info"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4 text-sm"
          >
            <div>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-500/20 mr-2">
                קטגוריה: {hoveredAisle.category}
              </span>
              <strong className="text-slate-200">{hoveredAisle.name}</strong>
              <span className="text-slate-400 text-xs block mt-1">
                מידע טקסטואלי: פוזיציית מדפים 1 (תחתון) עד {hoveredAisle.shelvesCount} (עליון), {hoveredAisle.shelvesCount} קומות מדף קיימות.
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3">
              <span>מוצרים במעבר זה: <b className="text-slate-200">{getHoveredAisleProducts().length}</b></span>
              <div className="flex -space-x-1 overflow-hidden">
                {getHoveredAisleProducts().slice(0, 3).map((prod) => (
                  <span key={prod.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-950 bg-slate-800 text-[9px] text-center leading-6 text-slate-300 font-bold" title={prod.name}>
                    {prod.name.substring(0, 1)}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : selectedProduct ? (
          <motion.div
            key="product-info"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-rose-950/30 p-4 border-t border-rose-900/30 flex flex-wrap justify-between items-center gap-4 text-sm"
          >
            <div>
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md border border-rose-500/30 mr-2">
                מיקום מדוד במלאי
              </span>
              <strong className="text-rose-100">{selectedProduct.name}</strong>
              <span className="text-rose-300/80 text-xs block mt-1">
                מיקום: <b className="text-white bg-rose-900/50 px-1.5 py-0.5 rounded">טור {aisles.find(a => a.id === selectedProduct.aisleId)?.number || selectedProduct.aisleId}</b> • <b>מדף {selectedProduct.shelfLevel}</b> • סגמנט <b>גובה {selectedProduct.shelfPosition}</b> שמאלה
              </span>
            </div>
            <div className="text-xs bg-rose-500/10 text-rose-300 py-1.5 px-3 rounded-lg border border-rose-500/20">
              משיכת קליפת נ"צ: [{getProductCoords(selectedProduct).x.toFixed(0)}px, {getProductCoords(selectedProduct).y.toFixed(0)}px] בספר הארוך
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty-info"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-950 p-4 border-t border-slate-800 text-center text-xs text-slate-500 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <span>החזק את העכבר מעל מעבר כלשהו לבירור שיוך הקטגוריות שלו בסופר או בחר מוצר לניווט</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
        .animate-route-flow {
          animation: dash 15s linear infinite;
        }
        .animate-route-flow-slow {
          animation: dash 35s linear infinite;
        }
      `}</style>
    </div>
  );
}
