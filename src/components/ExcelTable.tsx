import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product, StoreAisle } from '../types';
import { Search, Plus, Download, Upload, Trash2, Edit2, Check, RefreshCw, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface ExcelTableProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  aisles: StoreAisle[];
  onSelectProduct: (product: Product) => void;
  selectedProduct: Product | null;
}

export default function ExcelTable({
  products,
  setProducts,
  aisles,
  onSelectProduct,
  selectedProduct
}: ExcelTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    barcode: '',
    name: '',
    brand: '',
    category: 'שימורים ורטבים',
    aisleId: 'A2',
    shelfLevel: 3,
    shelfPosition: 2,
    price: 9.90,
    stock: 50
  });

  // Unique categories derived from aisles
  const categories = Array.from(new Set(aisles.map(a => a.category)));

  // Filtered products list
  const filteredProducts = products.filter(p =>
    p.name.includes(searchTerm) ||
    p.brand.includes(searchTerm) ||
    p.barcode.includes(searchTerm) ||
    p.category.includes(searchTerm)
  );

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.id || !editForm.name) return;
    setProducts(prev => prev.map(p => p.id === editForm.id ? (editForm as Product) : p));
    setEditingId(null);
    setEditForm({});
  };

  const deleteProduct = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה מטבלת המלאי?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) {
        // Clear selection if deleted
        onSelectProduct(null as any);
      }
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.barcode || !newProduct.name || !newProduct.brand) {
      setErrorMsg('אנא מלא את כל השדות החיוניים (שם, ברקוד, ומותג)');
      return;
    }

    const created: Product = {
      id: 'p_' + Date.now(),
      barcode: newProduct.barcode,
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category || 'כללי',
      aisleId: newProduct.aisleId || 'A1',
      shelfLevel: Number(newProduct.shelfLevel) || 1,
      shelfPosition: Number(newProduct.shelfPosition) || 1,
      price: Number(newProduct.price) || 0,
      stock: Number(newProduct.stock) || 0
    };

    setProducts(prev => [created, ...prev]);
    setIsAdding(false);
    setErrorMsg(null);
    setNewProduct({
      barcode: '',
      name: '',
      brand: '',
      category: 'שימורים ורטבים',
      aisleId: 'A2',
      shelfLevel: 3,
      shelfPosition: 2,
      price: 9.90,
      stock: 50
    });
  };

  // EXPORT TO EXCEL COMPATIBLE CSV
  const exportToCSV = () => {
    // Generate headers
    const headers = ['ברקוד (Barcode)', 'שם מוצר (Product Name)', 'מותג (Brand)', 'קטגוריה (Category)', 'קוד טור/מעבר (Aisle ID)', 'מספר מעבר (Aisle Number)', 'גובה מדף (Shelf Level)', 'מיקום רוחבי במדף (Shelf Position)', 'מחיר (Price)', 'כמות במלאי (Stock)'];
    
    // Generate rows
    const rows = products.map(p => {
      const aisle = aisles.find(a => a.id === p.aisleId);
      return [
        p.barcode,
        p.name,
        p.brand,
        p.category,
        p.aisleId,
        aisle ? aisle.number : '',
        p.shelfLevel,
        p.shelfPosition,
        p.price.toFixed(2),
        p.stock
      ];
    });

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => {
        // Escape quotes and commas
        const cleanedStr = String(val).replace(/"/g, '""');
        return cleanedStr.includes(',') || cleanedStr.includes('\n') || cleanedStr.includes('"') ? `"${cleanedStr}"` : cleanedStr;
      }).join(','))
    ].join('\r\n');

    // Add Hebrew BOM to prevent Excel encoding corruptions! Very critical!
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `supermarket_inventory_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // MOCK CSV FILE IMPORT SIMULATION
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Simple CSV parser
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) throw new Error('הקובץ ריק או לא תקין');

        const newParsedProducts: Product[] = [];
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Regex to handle split by comma preserving quotes
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          if (matches.length < 5) continue;

          const cleanCell = (str: string) => str.replace(/^"|"$/g, '').trim();

          const barcode = cleanCell(matches[0]);
          const name = cleanCell(matches[1]);
          const brand = cleanCell(matches[2]);
          const category = cleanCell(matches[3]);
          const aisleId = cleanCell(matches[4]);
          const shelfLevel = Number(cleanCell(matches[6])) || 1;
          const shelfPosition = Number(cleanCell(matches[7])) || 1;
          const price = Number(cleanCell(matches[8])) || 0;
          const stock = Number(cleanCell(matches[9])) || 0;

          if (barcode && name) {
            newParsedProducts.push({
              id: 'csv_' + i + '_' + Date.now(),
              barcode,
              name,
              brand,
              category,
              aisleId,
              shelfLevel,
              shelfPosition,
              price,
              stock
            });
          }
        }

        if (newParsedProducts.length > 0) {
          setProducts(newParsedProducts);
          alert(`ייבוא הושלם בהצלחה! נטענו ${newParsedProducts.length} מוצרים מהאקסל שלכם.`);
        } else {
          alert('שגיאה: לא זוהו מוצרים תקינים לייבוא. וודא שהקובץ תואם לפורמט.');
        }
      } catch (err) {
        alert('שגיאה בקריאת קובץ CSV. בדוק את המבנה ונסה שוב.');
        console.error(err);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Load pre-configured sample dataset
  const resetToSample = () => {
    if (confirm('האם ברצונך לשחזר את טבלת המלאי לנתוני המופת המקוריים? שינויים קודמים יימחקו.')) {
      window.location.reload();
    }
  };

  return (
    <div id="excel-table-container" className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full">
      
      {/* Table Header Controls */}
      <div className="bg-slate-950 p-5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-slate-100">מנהל מלאי ואקסל - פלנוגרמה (סנכרון חנות)</h3>
            <p className="text-xs text-slate-400">ניהול מקורות המידע שהסופרמרקט מעדכן. כל שינוי משפיע מיידית על המפה והניווט!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            title="ייצא קובץ CSV מוכן לעריכה באקסל"
          >
            <Download className="w-4 h-4" />
            <span>ייצא לאקסל (CSV)</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>ייבא מאקסל (CSV)</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>הוסף מוצר חדש</span>
          </button>

          <button
            onClick={resetToSample}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 transition"
            title="איפוס נתונים"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Adding item form collapse wrapper */}
      {isAdding && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-slate-950/40 p-5 border-b border-slate-800"
        >
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs text-slate-300">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">ברקוד פריט *</label>
              <input
                type="text"
                placeholder="לדוג' 72900011.."
                value={newProduct.barcode}
                onChange={e => setNewProduct(prev => ({ ...prev, barcode: e.target.value }))}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">שם מוצר מלא *</label>
              <input
                type="text"
                placeholder="לדוג' קקאו לשתייה"
                value={newProduct.name}
                onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">מותג / יצרן *</label>
              <input
                type="text"
                placeholder="לדוג' עלית"
                value={newProduct.brand}
                onChange={e => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">קטגוריה</label>
              <select
                value={newProduct.category}
                onChange={e => {
                  const selectedCategory = e.target.value;
                  // Auto assign aisle if possible to simplify for user
                  const matchingAisle = aisles.find(a => a.category === selectedCategory);
                  setNewProduct(prev => ({
                    ...prev,
                    category: selectedCategory,
                    aisleId: matchingAisle ? matchingAisle.id : prev.aisleId
                  }));
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">מיקום טור (מפה)</label>
              <select
                value={newProduct.aisleId}
                onChange={e => setNewProduct(prev => ({ ...prev, aisleId: e.target.value }))}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
              >
                {aisles.map(a => (
                  <option key={a.id} value={a.id}>{a.name.split(' - ')[0]} ({a.category})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">גובה מדף (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={newProduct.shelfLevel}
                onChange={e => setNewProduct(prev => ({ ...prev, shelfLevel: Number(e.target.value) }))}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">מיקום רוחבי (סגמנט 1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={newProduct.shelfPosition}
                onChange={e => setNewProduct(prev => ({ ...prev, shelfPosition: Number(e.target.value) }))}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">מחיר לצרכן (ש"ח)</label>
              <input
                type="number"
                step="0.1"
                value={newProduct.price}
                onChange={e => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400 font-medium">כמות במלאי</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={e => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2 rounded-lg transition"
              >
                שמור מוצר במאגר
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="mt-3 text-rose-400 flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Quick search input */}
      <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-800 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4.5 h-4.5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="חפש מוצר לסנכרון באמצעות שם, מותג, ברקוד, קטגוריה או מספר מעבר..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pr-10 pl-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400 shrink-0 font-mono">
          תוצאות: <b className="text-slate-200">{filteredProducts.length}</b> מתוך <b className="text-slate-200">{products.length}</b>
        </div>
      </div>

      {/* Spreadsheet grid */}
      <div className="flex-1 overflow-auto max-h-[480px]">
        <table className="w-full border-collapse text-right text-xs text-slate-300 relative">
          <thead className="bg-slate-950 text-slate-400 font-sans tracking-tight sticky top-0 border-b border-slate-800 z-10">
            <tr>
              <th className="p-3 text-center border-l border-slate-800/50 w-24">פעולות</th>
              <th className="p-3 font-semibold">שם מוצר</th>
              <th className="p-3 font-semibold">מותג</th>
              <th className="p-3 font-semibold">ברקוד</th>
              <th className="p-3 font-semibold">קטגוריה</th>
              <th className="p-3 font-semibold text-center">טור במפה</th>
              <th className="p-3 font-semibold text-center">קומה במדף</th>
              <th className="p-3 font-semibold text-center">מיקום רוחבי</th>
              <th className="p-3 font-semibold text-left">מחיר ש"ח</th>
              <th className="p-3 font-semibold text-center">מלאי</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredProducts.map((p) => {
              const AisleInfo = aisles.find(a => a.id === p.aisleId);
              const isSelected = selectedProduct?.id === p.id;
              const isEditing = editingId === p.id;

              return (
                <tr
                  key={p.id}
                  onClick={() => !isEditing && onSelectProduct(p)}
                  className={`transition-colors duration-150 group cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/10 text-indigo-100 border-r-4 border-indigo-500'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  {/* Action cell */}
                  <td className="p-2 text-center border-l border-slate-800/50 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={saveEdit}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md"
                          title="שמור"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md"
                          title="ביטול"
                        >
                          <span className="text-[10px] px-1 font-semibold">X</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition"
                          title="ערוך מוצר"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition"
                          title="מחק מוצר"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="p-3 font-medium text-slate-100">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 w-full text-white text-xs text-right"
                      />
                    ) : (
                      p.name
                    )}
                  </td>

                  {/* Brand */}
                  <td className="p-3 text-slate-300">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.brand || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, brand: e.target.value }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 w-24 text-white text-xs text-right"
                      />
                    ) : (
                      p.brand
                    )}
                  </td>

                  {/* Barcode */}
                  <td className="p-3 font-mono text-slate-400">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.barcode || ''}
                        onChange={e => setEditForm(prev => ({ ...prev, barcode: e.target.value }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 w-28 text-white text-xs font-mono"
                      />
                    ) : (
                      p.barcode
                    )}
                  </td>

                  {/* Category */}
                  <td className="p-3 text-slate-400">
                    {isEditing ? (
                      <select
                        value={editForm.category}
                        onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-xs"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      p.category
                    )}
                  </td>

                  {/* Aisle */}
                  <td className="p-3 text-center">
                    {isEditing ? (
                      <select
                        value={editForm.aisleId}
                        onChange={e => setEditForm(prev => ({ ...prev, aisleId: e.target.value }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 text-white text-xs"
                      >
                        {aisles.map(a => (
                          <option key={a.id} value={a.id}>{a.number} ({a.category})</option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-200 font-bold border border-slate-750">
                        {AisleInfo ? `טור ${AisleInfo.number}` : p.aisleId}
                      </span>
                    )}
                  </td>

                  {/* Shelf Level */}
                  <td className="p-3 text-center font-mono">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editForm.shelfLevel || 1}
                        onChange={e => setEditForm(prev => ({ ...prev, shelfLevel: Number(e.target.value) }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 w-12 text-white text-xs text-center"
                      />
                    ) : (
                      p.shelfLevel
                    )}
                  </td>

                  {/* Shelf Position */}
                  <td className="p-3 text-center font-mono">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editForm.shelfPosition || 1}
                        onChange={e => setEditForm(prev => ({ ...prev, shelfPosition: Number(e.target.value) }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 w-12 text-white text-xs text-center"
                      />
                    ) : (
                      p.shelfPosition
                    )}
                  </td>

                  {/* Price */}
                  <td className="p-3 text-left font-mono font-bold text-emerald-400">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.price || 0}
                        onChange={e => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 w-16 text-white text-xs text-left"
                      />
                    ) : (
                      `₪${p.price.toFixed(2)}`
                    )}
                  </td>

                  {/* Stock */}
                  <td className="p-3 text-center font-mono">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.stock || 0}
                        onChange={e => setEditForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className="bg-slate-950 border border-slate-700 rounded p-1 w-14 text-white text-xs text-center"
                      />
                    ) : (
                      <span className={p.stock < 30 ? "text-rose-400 font-bold" : "text-slate-300"}>
                        {p.stock}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info indicator */}
      <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
        <span>* מזהה הטורים המקפיא (A8), המאפייה (A7), והחלבה (A6) משולבים גם הם בטבלה.</span>
        <span>גרור או הקלק עמודות למיון (סימולציה תכנונית)</span>
      </div>
    </div>
  );
}
