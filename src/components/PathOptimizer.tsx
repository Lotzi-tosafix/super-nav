import React, { useState } from 'react';
import { Product, StoreAisle, OptimizedStep } from '../types';
import { ShoppingCart, Play, CheckCircle2, Trophy, ArrowLeft, Trash, Route, StepForward, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PathOptimizerProps {
  products: Product[];
  aisles: StoreAisle[];
  shoppingList: Product[];
  setShoppingList: React.Dispatch<React.SetStateAction<Product[]>>;
  userPos: { x: number; y: number };
  onRouteCalculated: (route: OptimizedStep[] | null) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (idx: number) => void;
}

export default function PathOptimizer({
  products,
  aisles,
  shoppingList,
  setShoppingList,
  userPos,
  onRouteCalculated,
  currentStepIndex,
  setCurrentStepIndex
}: PathOptimizerProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [optimizedSteps, setOptimizedSteps] = useState<OptimizedStep[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');

  // Helper to translate product to map pixel coordinates
  const getProductGridCoords = (product: Product) => {
    const aisle = aisles.find((a) => a.id === product.aisleId);
    if (!aisle) return { x: 6, y: 4 };

    const isVertical = aisle.height > aisle.width;
    if (isVertical) {
      const xFactor = 0.5;
      const yFactor = 0.15 + (product.shelfLevel / (aisle.shelvesCount + 1)) * 0.7;
      return { x: aisle.x + aisle.width * xFactor, y: aisle.y + aisle.height * yFactor };
    } else {
      const xFactor = 0.1 + (product.shelfPosition / 6) * 0.8;
      const yFactor = 0.5;
      return { x: aisle.x + aisle.width * xFactor, y: aisle.y + aisle.height * yFactor };
    }
  };

  const addToShoppingList = (productId: string) => {
    if (!productId) return;
    const prod = products.find(p => p.id === productId);
    if (prod && !shoppingList.some(item => item.id === prod.id)) {
      setShoppingList(prev => [...prev, prod]);
    }
    setSelectedProductToAdd('');
  };

  const removeFromList = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const clearList = () => {
    setShoppingList([]);
    cancelNavigation();
  };

  // GREEDY TSP ALGORITHM
  // Computes short path starting from active User position, visiting all checked products, ending at Checkout
  const calculateOptimizedPath = () => {
    if (shoppingList.length === 0) return;

    const unvisited = [...shoppingList];
    let currentPoint = { x: userPos.x, y: userPos.y };
    const route: OptimizedStep[] = [];

    while (unvisited.length > 0) {
      let nearestIdx = -1;
      let minDistance = Infinity;
      let nearestCoords = { x: 0, y: 0 };

      // Find physically closest remaining product (Euclidean calculation)
      for (let i = 0; i < unvisited.length; i++) {
        const prodCoords = getProductGridCoords(unvisited[i]);
        const dx = prodCoords.x - currentPoint.x;
        const dy = prodCoords.y - currentPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          nearestIdx = i;
          nearestCoords = prodCoords;
        }
      }

      if (nearestIdx !== -1) {
        const nextProduct = unvisited[nearestIdx];
        const aisle = aisles.find(a => a.id === nextProduct.aisleId);
        
        route.push({
          productId: nextProduct.id,
          productName: nextProduct.name,
          aisleId: nextProduct.aisleId,
          aisleName: aisle?.name || 'מעבר כללי',
          shelfLevel: nextProduct.shelfLevel,
          shelfPosition: nextProduct.shelfPosition,
          x: nearestCoords.x,
          y: nearestCoords.y,
          distance: minDistance
        });

        // Set current point to target, delete from list
        currentPoint = nearestCoords;
        unvisited.splice(nearestIdx, 1);
      }
    }

    // Finally append the checkout counter (X=1.2, Y=6.7)
    const checkoutCoords = { x: 1.2, y: 6.7 };
    const dx = checkoutCoords.x - currentPoint.x;
    const dy = checkoutCoords.y - currentPoint.y;
    route.push({
      productId: undefined,
      productName: 'קופות תשלום וסיום קנייה',
      aisleId: 'CHECKOUT',
      aisleName: 'איזור קופות תשלום',
      shelfLevel: 0,
      shelfPosition: 0,
      x: checkoutCoords.x,
      y: checkoutCoords.y,
      distance: Math.sqrt(dx * dx + dy * dy)
    });

    setOptimizedSteps(route);
    onRouteCalculated(route);
    setCurrentStepIndex(0);
    setIsNavigating(true);
  };

  const handleNextStep = () => {
    if (currentStepIndex < optimizedSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const cancelNavigation = () => {
    setIsNavigating(false);
    setOptimizedSteps([]);
    onRouteCalculated(null);
    setCurrentStepIndex(0);
  };

  const activeStep = optimizedSteps[currentStepIndex];

  return (
    <div id="path-optimizer-container" className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <Route className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-lg text-slate-100">מתכנן מסלול קניות אופטימלי (Waze)</h3>
          <p className="text-xs text-slate-400">פתרון מתמטי (TSP) המחשב את המסלול הקצר ביותר ללא זיגזגים וחזרות</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isNavigating ? (
          <motion.div
            key="list-builder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col gap-4 text-xs"
          >
            {/* Choose product to add dropdown */}
            <div className="flex gap-2">
              <select
                value={selectedProductToAdd}
                onChange={e => setSelectedProductToAdd(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="">-- בחר מוצר להוספה לרשימת הקניות --</option>
                {products
                  .filter(p => !shoppingList.some(item => item.id === p.id))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand}) - ₪{p.price.toFixed(2)}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => addToShoppingList(selectedProductToAdd)}
                disabled={!selectedProductToAdd}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition shrink-0"
              >
                הוסף לרשימה
              </button>
            </div>

            {/* List items block */}
            <div className="flex-1 min-h-[180px] max-h-[300px] overflow-auto border border-slate-850 bg-slate-950/40 rounded-2xl p-4">
              {shoppingList.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 gap-2 py-6">
                  <ShoppingCart className="w-10 h-10 text-slate-700" />
                  <p className="font-semibold text-slate-400">רשימת הקניות ריקה</p>
                  <p className="max-w-[240px] text-[11px]">הוסף מוצרים מהרשימה הנפתחת לעיל או לחץ על מוצר כלשהו בטבלת האקסל כדי להתחיל</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {shoppingList.map((item) => {
                    const aisle = aisles.find(a => a.id === item.aisleId);
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition"
                      >
                        <div className="flex flex-col gap-1 pr-1.5">
                          <span className="font-semibold text-slate-100">{item.name}</span>
                          <div className="flex gap-2 items-center text-[10px] text-slate-400">
                            <span>מותג: <b>{item.brand}</b></span>
                            <span>•</span>
                            <span className="text-slate-300">מיקום: <b>טור {aisle?.number}</b>, מדף {item.shelfLevel}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromList(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="הסר מוצר"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Complete trigger buttons */}
            {shoppingList.length > 0 && (
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={clearList}
                  className="px-4 py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition text-xs"
                >
                  נקה הכל
                </button>
                <button
                  onClick={calculateOptimizedPath}
                  className="flex-1 flex justify-center items-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-[0_4px_20px_rgba(16,185,129,0.25)] text-xs"
                >
                  <Play className="w-4 h-4" />
                  <span>חשב מסלול קנייה אופטימלי ({shoppingList.length} מוצרים)</span>
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="navigation-instructions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col gap-4 text-xs"
          >
            {/* Step navigation controller header */}
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">מסלול הליכה נוכחי</span>
              <button
                onClick={cancelNavigation}
                className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg transition text-[10px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>חזור לעריכה</span>
              </button>
            </div>

            {/* Current Instruction card */}
            {activeStep ? (
              <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                      שלב {currentStepIndex + 1} מתוך {optimizedSteps.length}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      מרחק סימולטיבי: {(activeStep.distance * 3).toFixed(0)} מטר 
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 flex items-start gap-1.5 mb-1.5 leading-snug">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      {activeStep.productId ? `אסוף: ${activeStep.productName}` : activeStep.productName}
                    </span>
                  </h4>

                  {activeStep.productId && (
                    <div className="mt-3.5 space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div className="flex flex-col">
                          <span className="text-slate-500">שיוך מעבר</span>
                          <span className="font-bold text-slate-100">{activeStep.aisleName}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 font-mono">מיקום דיגיטלי</span>
                          <span className="font-bold text-emerald-400">טור {aisles.find(a => a.id === activeStep.aisleId)?.number}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 font-mono">גובה מדף פלנוגרמה</span>
                          <span className="font-bold text-slate-100">קומה {activeStep.shelfLevel}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500 font-mono">רוחב מדף (סגמנט)</span>
                          <span className="font-bold text-slate-100">תא רוחבי {activeStep.shelfPosition}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!activeStep.productId && (
                    <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/15 mt-3 text-center">
                      <Trophy className="w-8 h-8 text-indigo-400 mx-auto mb-1.5" />
                      <p className="font-semibold text-indigo-200">הגעת ליעד הסופי!</p>
                      <p className="text-[10.5px] text-slate-400 mt-1">כל המוצרים בסל הקניות נאספו במסלול הקצר והיעיל ביותר. מוזמן לגשת לקופה לתשלום קל ונוח.</p>
                    </div>
                  )}
                </div>

                {/* Progress control buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-900">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="flex-1 py-2 border border-slate-800 hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 rounded-xl transition text-[11px]"
                  >
                    הקודם
                  </button>
                  {currentStepIndex < optimizedSteps.length - 1 ? (
                    <button
                      onClick={handleNextStep}
                      className="flex-[1.5] py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex justify-center items-center gap-1.5 text-[11px]"
                    >
                      <span>המוצר הבא נאסף</span>
                      <StepForward className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={cancelNavigation}
                      className="flex-[1.5] py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition text-[11px]"
                    >
                      סיום ואיפוס רשימה
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-500">שגיאה בטעינת שלבי הניווט</div>
            )}

            {/* Compact routing list overview */}
            <div className="flex flex-col gap-1 text-[11px] max-h-[140px] overflow-auto border border-slate-850 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 mb-1 font-semibold">סדר האיסוף המלא הנגזר מהאלגוריתם:</span>
              {optimizedSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center p-1.5 rounded-lg border ${
                    idx === currentStepIndex
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100 font-bold'
                      : idx < currentStepIndex
                      ? 'border-transparent text-slate-500 line-through'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  <span className="truncate">{idx + 1}. {step.productName}</span>
                  <span className="text-[9px] px-1 bg-slate-950/60 rounded text-slate-500">
                    {step.productId ? `טור ${aisles.find(a => a.id === step.aisleId)?.number}` : 'קופות'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
