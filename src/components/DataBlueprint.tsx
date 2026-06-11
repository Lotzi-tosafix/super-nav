import React, { useState } from 'react';
import { Copy, Check, FileCode, FileSpreadsheet, Map, CheckCircle2, Star } from 'lucide-react';
import { motion } from 'motion/react';

export default function DataBlueprint() {
  const [copiedText, setCopiedText] = useState<'excel' | 'json' | null>(null);

  const excelStructure = `ברקוד (Barcode),שם מוצר (Product Name),מותג (Brand),קטגוריה (Category),קוד טור (Aisle ID),מספר מעבר (Aisle Number),גובה מדף (Shelf Level),מיקום רוחבי (Shelf Position),מחיר (Price),כמות במלאי (Stock)
7290000123451,רוטב פטריות אסם 350 גרם,אסם,שימורים ורטבים,A2,2,3,2,11.90,45
7290000543210,פסטה ספגטי אסם 500 גרם,אסם,שימורים ורטבים,A2,2,2,4,4.90,120
7290000067441,אורז בסמטי קלאסי סוגת 1 ק"ג,סוגת,קטניות ודגנים,A1,1,3,3,9.80,80`;

  const jsonStructure = `{
  "aisles": [
    {
      "id": "A1",
      "name": "מעבר 1 - דגנים, קטניות ואורז",
      "number": 1,
      "x": 2,
      "y": 1.5,
      "width": 1.2,
      "height": 4.5,
      "shelvesCount": 5,
      "category": "קטניות ודגנים"
    }
  ]
}`;

  const handleCopy = (text: string, type: 'excel' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div id="data-blueprint" className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col h-full text-right">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
          <FileCode className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-lg text-slate-100">מדריך אפיון מידע: מפות ואקסל בסופרמרקט</h3>
          <p className="text-xs text-slate-400">הסבר טכני מקיף על פירמוט מפות ורשימות מוצרים לצורך ייבוא וקריאה במערכת המקלדת</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-slate-350">
        
        {/* Right side: Excel/Inventory Explanation */}
        <div className="flex flex-col gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">פרטי המוצר</span>
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>עבודה עם קובץ אקסל (ספרידשיט)</span>
            </h4>
          </div>

          <p className="leading-relaxed text-xs">
            אכן, **אקסל (Excel) הוא הכלי האידיאלי והקל ביותר לשימוש** על ידי צוות המלאי בסופר.
            על מנת שהאפליקציה תוכל לקרוא את קובץ האקסל, מייצאים אותו מתוך אקסל כפורמט **CSV (ערכים מופרדים בפסיקים)** שהוא קובץ פורמט טקסט פשוט שניתן לפענח בקלות באמצעות ג'אווהסקריפט או קריאת API פשוטה.
          </p>

          <div className="space-y-2 mt-2 text-xs">
            <h5 className="font-bold text-slate-300">העמודות הנדרשות בקובץ:</h5>
            <ul className="list-disc list-inside space-y-1.5 pr-2 leading-relaxed">
              <li><b>ברקוד (Barcode):</b> מפתח ייחודי המזהה את המוצר (מספרי).</li>
              <li><b>שם מוצר (Product Name):</b> שם תיאורי ברור וקריא בחיפוש.</li>
              <li><b>מותג (Brand):</b> יצרן המוצר לסינון מתקדם.</li>
              <li><b>קוד טור (Aisle ID):</b> המזהה המקשר של המעבר במפה (למשל <code className="text-emerald-400 font-mono">A1</code>, <code className="text-emerald-400 font-mono">A2</code>).</li>
              <li><b>גובה מדף (Shelf Level):</b> קומה פיזית של המדף מלמטה למעלה (1 עד 5).</li>
              <li><b>מיקום רוחבי (Shelf Position):</b> מזהה תא רוחבי משמאל לימין בתוך המדף לשליפה כירורגית.</li>
              <li><b>מחיר ומלאי:</b> פרטי ערך כלכליים כלליים.</li>
            </ul>
          </div>

          {/* Copyable code segment */}
          <div className="mt-4 relative">
            <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded-t-xl border-t border-x border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => handleCopy(excelStructure, 'excel')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
              >
                {copiedText === 'excel' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === 'excel' ? 'הועתק!' : 'העתק CSV דוגמה'}</span>
              </button>
              <span className="text-slate-400">supermarket_data.csv</span>
            </div>
            <pre className="bg-slate-950 p-3 rounded-b-xl border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto select-all text-left">
              {excelStructure}
            </pre>
          </div>

          <div className="bg-indigo-950/20 px-3 py-2.5 rounded-xl border border-indigo-500/10 text-[11px] text-slate-400 leading-relaxed">
            💡 <b>טיפ למפתחים לגבי עברית באקסל:</b> תוכנת אקסל של מיקרוסופט נוטה לשבש עברית בייצוא/ייבוא CSV. כדי לפתור זאת יש להוסיף בתחילת מחרוזת ה-CSV קוד תווים מזהה הנקרא <b>UTF-8 BOM (מזהה סדר בתים)</b> המקודד כ- <code className="text-indigo-400 font-mono">\uFEFF</code>. האפליקציה הזו עושה זאת אוטומטית בהורדה לשביעות רצון מלאה!
          </div>
        </div>

        {/* Left side: Maps/Coordinates Explanation */}
        <div className="flex flex-col gap-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-bold">מפת הסופרמרקט</span>
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <Map className="w-4 h-4 text-indigo-400" />
              <span>יצירה וקריאה של מפת החנות</span>
            </h4>
          </div>

          <p className="leading-relaxed text-xs">
            כדי ליצור מפה שהאפליקציה תדע לפענח בצורה ויזואלית, מגדירים את גבולות החנות במערכת קואורדינטות דו-ממדית (GIS) או רשת גריד. הקובץ המועדף לייצוג המפה הוא **קובץ מבוסס JSON** המגדיר פוליגונים ומעברים.
          </p>

          <div className="space-y-2 mt-2 text-xs">
            <h5 className="font-bold text-slate-300">איך יוצרים את המפה (כלים נפוצים)?</h5>
            <ul className="list-disc list-inside space-y-1.5 pr-2 leading-relaxed">
              <li><b>כלי CAD או ווקטורים (AutoCAD / Adobe Illustrator):</b> אדריכל הסניף יוצר סקיצה וקטורית של הסניף ומייצא אותה בפורמט <b>SVG (Scalable Vector Graphics)</b>. קובץ SVG הוא קובץ הניתן לקריאה ועריכה ישירה ב-HTML וג'אווהסקריפט, מה שמאפשר לצבוע ולסמן מעברים בצורה דינמית כמו שמוצג בסימולטור שלנו!</li>
              <li><b>מערכות ניהול מפה ייעודיות באייפון / סמארטפון:</b> בעזרת סורק LiDAR מובנה במכשיר, ניתן ללכת לאורך סופרמרקט ענק, לקבל מפה תלת ממדית מדויקת, ולהמיר אותה לקרודינטות קלות דו-ממדיות המאושרות על ידי המערכת.</li>
            </ul>
          </div>

          {/* Copyable code segment */}
          <div className="mt-4 relative">
            <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded-t-xl border-t border-x border-slate-800 text-[10px] font-mono">
              <button
                onClick={() => handleCopy(jsonStructure, 'json')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
              >
                {copiedText === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === 'json' ? 'הועתק!' : 'העתק JSON דוגמה'}</span>
              </button>
              <span className="text-slate-400">aisle_schema.json</span>
            </div>
            <pre className="bg-slate-950 p-3 rounded-b-xl border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto select-all text-left">
              {jsonStructure}
            </pre>
          </div>

          <div className="space-y-1 mt-1 text-xs">
            <h5 className="font-bold text-slate-300">חיבור המוצרים למפה:</h5>
            <p className="leading-relaxed">
              האינטגרציה היא פשוטה להפליא: כאשר המוצר בטבלה מחזיק במפתח <code className="text-indigo-400 font-mono">aisleId = "A1"</code>, המערכת מחפשת את האובייקט בעל מזהה זה ב-JSON, שואבת את נקודות המיקום של המעבר על מפת ה-SVG, ומייצרת סמן (Pin) עם אנימציית פולס זוהר ישירות בטור המתאים!
            </p>
          </div>
        </div>

      </div>

      <div className="mt-6 pt-5 border-t border-slate-800 bg-emerald-950/15 p-4 rounded-2xl border border-emerald-500/10 text-xs flex items-center gap-3">
        <Star className="w-5 h-5 text-emerald-400 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-slate-100 block mb-0.5">סיכום תפעולי שימושי:</strong>
          השילוב של <b>מפת SVG קלה המבוססת על קואורדינטות JSON</b> לבין <b>טבלת אקסל פשוטה שצוות המלאי מעדכן</b> מייצר את הפתרון הזול ביותר, המהיר לפיתוח ועמיד ביותר לתחזוק לאורך זמן עבור כל מנהל סניף מזון בישראל!
        </div>
      </div>
    </div>
  );
}
