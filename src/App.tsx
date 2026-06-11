import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_AISLES, INITIAL_PRODUCTS } from './data';
import { Product, StoreAisle, OptimizedStep } from './types';
import InteractiveMap from './components/InteractiveMap';
import ExcelTable from './components/ExcelTable';
import PathOptimizer from './components/PathOptimizer';
import DataBlueprint from './components/DataBlueprint';

// Lucide icons
import { Map, FileSpreadsheet, Compass, Search, HelpCircle, FileText, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  // Application databases
  const [aisles] = useState<StoreAisle[]>(INITIAL_AISLES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Active interaction states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'simulation' | 'inventory' | 'blueprint'>('simulation');
  
  // Driving route simulation states
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedStep[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  
  // Shopping list selected items representation
  const [shoppingList, setShoppingList] = useState<Product[]>([]);

  // Simulated blue user point (X, Y) layout starting location
  const [userPos, setUserPos] = useState({ x: 9.5, y: 7 }); // near the entrance by default

  const handleSelectProductFromTable = (product: Product) => {
    setSelectedProduct(product);
    // Switch to simulator tab so user can see their selected item on the map immediately!
    setActiveTab('simulation');
    
    // Smooth scroll to map if they are on mobile
    const mapElement = document.getElementById('interactive-map-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRouteCalculated = (route: OptimizedStep[] | null) => {
    setOptimizedRoute(route);
    if (route && route.length > 0) {
      // Clear specific single product search so we can highlight the multi-stops path cleanly!
      setSelectedProduct(null);
    }
  };

  // High performance clear search
  const handleClearRouteAndSelection = () => {
    setSelectedProduct(null);
    setOptimizedRoute(null);
    setCurrentStepIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Visual Header Grid & Branding */}
      <header className="bg-slate-900 border-b border-slate-850 px-6 py-5 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Description */}
          <div className="flex items-center gap-3.5 text-right w-full md:w-auto">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl shadow-lg shadow-indigo-500/20 text-white block">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  MVP אבטיפוס
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 py-0.5 px-2 rounded-full font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  אבטחה מקסימלית
                </span>
              </div>
              <h1 className="font-sans font-black text-2xl text-slate-50 tracking-tight mt-1">
                סופר ניווט – מפות חנות ומלאי אופטימלי
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                כלי פיתוח וסימולציה הממחיש כיצד אפליקציה קוראת מפות סופר ותכנון מסלול קניות (TSP) מאקסל
              </p>
            </div>
          </div>

          {/* Navigation Controls (Action bar Tabs) */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'simulation'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>סימולטור ניווט</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>מנהל מלאי ואקסל</span>
            </button>
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition ${
                activeTab === 'blueprint'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>מדריך אפיון מידע</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Body Layout content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-stretch">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: NAVIGATION & ROUTING SIMULATOR */}
          {activeTab === 'simulation' && (
            <motion.div
              key="simulation-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Map panel */}
              <div className="lg:col-span-7 xl:col-span-8 h-full">
                <InteractiveMap
                  aisles={aisles}
                  products={products}
                  selectedProduct={selectedProduct}
                  optimizedRoute={optimizedRoute}
                  currentStepIndex={currentStepIndex}
                  userPos={userPos}
                  setUserPos={setUserPos}
                />
              </div>

              {/* Shopping checklist panel */}
              <div className="lg:col-span-5 xl:col-span-4 h-full">
                <PathOptimizer
                  products={products}
                  aisles={aisles}
                  shoppingList={shoppingList}
                  setShoppingList={setShoppingList}
                  userPos={userPos}
                  onRouteCalculated={handleRouteCalculated}
                  currentStepIndex={currentStepIndex}
                  setCurrentStepIndex={setCurrentStepIndex}
                />

                {/* Single searching and location hints details */}
                {(selectedProduct || optimizedRoute) && (
                  <button
                    onClick={handleClearRouteAndSelection}
                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-slate-300 py-3 rounded-2xl border border-slate-800 text-xs font-semibold select-none flex items-center justify-center gap-2 transition"
                  >
                    <span>נקה סימון ומסלול פעיל מהמפה</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: EXCEL / SPREADSHEET MANAGER */}
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <ExcelTable
                products={products}
                setProducts={setProducts}
                aisles={aisles}
                onSelectProduct={handleSelectProductFromTable}
                selectedProduct={selectedProduct}
              />
            </motion.div>
          )}

          {/* TAB 3: SPECIFICATIONS & GUIDES */}
          {activeTab === 'blueprint' && (
            <motion.div
              key="blueprint-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <DataBlueprint />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer credits and information */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 mt-auto select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>כל העיצובים והאפקטים ברמה הקריאטיבית הגבוהה ביותר - מעודכנים לשנת 2026</span>
          </div>
          <p>
            אבטיפוס פותח בשיתוף פעולה טכנולוגי • המידע מוגן בצורה מאובטחת ומקומי בדפדפן הלקוח
          </p>
        </div>
      </footer>
    </div>
  );
}
