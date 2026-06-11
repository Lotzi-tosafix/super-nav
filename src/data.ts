import { StoreAisle, Product } from './types';

export const INITIAL_AISLES: StoreAisle[] = [
  {
    id: 'A1',
    name: 'מעבר 1 - דגנים, קטניות ואורז',
    number: 1,
    x: 2,
    y: 1.5,
    width: 1.2,
    height: 4.5,
    shelvesCount: 5,
    category: 'קטניות ודגנים'
  },
  {
    id: 'A2',
    name: 'מעבר 2 - שימורים, רטבים ושמן',
    number: 2,
    x: 4,
    y: 1.5,
    width: 1.2,
    height: 4.5,
    shelvesCount: 5,
    category: 'שימורים ורטבים'
  },
  {
    id: 'A3',
    name: 'מעבר 3 - חטיפים, מתוקים וקורנפלקס',
    number: 3,
    x: 6,
    y: 1.5,
    width: 1.2,
    height: 4.5,
    shelvesCount: 5,
    category: 'חטיפים ומתוקים'
  },
  {
    id: 'A4',
    name: 'מעבר 4 - מוצרי אפייה, תבלינים וסוכר',
    number: 4,
    x: 8,
    y: 1.5,
    width: 1.2,
    height: 4.5,
    shelvesCount: 5,
    category: 'אפייה ותבלינים'
  },
  {
    id: 'A5',
    name: 'מעבר 5 - משקאות קלים, בירה ושתייה חמה',
    number: 5,
    x: 10,
    y: 1.5,
    width: 1.2,
    height: 4.5,
    shelvesCount: 5,
    category: 'משקאות וקלייה'
  },
  {
    id: 'A6',
    name: 'מקרר חלביה וסלטים',
    number: 6,
    x: 1.5,
    y: 0.3,
    width: 10,
    height: 0.7,
    shelvesCount: 4,
    category: 'מוצרי חלב'
  },
  {
    id: 'A7',
    name: 'מחלקת מאפייה ולחמים',
    number: 7,
    x: 0.3,
    y: 1.5,
    width: 1,
    height: 4.5,
    shelvesCount: 3,
    category: 'מאפייה'
  },
  {
    id: 'A8',
    name: 'מקפיאים - גלידות, בורקסים וירקות קפואים',
    number: 8,
    x: 3,
    y: 6.6,
    width: 7,
    height: 0.9,
    shelvesCount: 3,
    category: 'קפואים'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    barcode: '7290000123451',
    name: 'רוטב פטריות אסם 350 גרם',
    category: 'שימורים ורטבים',
    aisleId: 'A2',
    shelfLevel: 3,
    shelfPosition: 2,
    price: 11.90,
    brand: 'אסם',
    stock: 45
  },
  {
    id: 'p2',
    barcode: '7290000543210',
    name: 'פסטה ספגטי אסם 500 גרם',
    category: 'שימורים ורטבים',
    aisleId: 'A2',
    shelfLevel: 2,
    shelfPosition: 4,
    price: 4.90,
    brand: 'אסם',
    stock: 120
  },
  {
    id: 'p3',
    barcode: '7290001188331',
    name: 'רסק עגבניות פרי הגליל 100 גרם',
    category: 'שימורים ורטבים',
    aisleId: 'A2',
    shelfLevel: 4,
    shelfPosition: 1,
    price: 2.50,
    brand: 'פרי הגליל',
    stock: 200
  },
  {
    id: 'p4',
    barcode: '7290000067441',
    name: 'אורז בסמטי קלאסי סוגת 1 ק"ג',
    category: 'קטניות ודגנים',
    aisleId: 'A1',
    shelfLevel: 3,
    shelfPosition: 3,
    price: 9.80,
    brand: 'סוגת',
    stock: 80
  },
  {
    id: 'p5',
    barcode: '7290000067557',
    name: 'עדשים ירוקות סוגת 1 ק"ג',
    category: 'קטניות ודגנים',
    aisleId: 'A1',
    shelfLevel: 2,
    shelfPosition: 2,
    price: 8.50,
    brand: 'סוגת',
    stock: 55
  },
  {
    id: 'p6',
    barcode: '7290100854446',
    name: 'שוקולד פרה חלב עלית 100 גרם',
    category: 'חטיפים ומתוקים',
    aisleId: 'A3',
    shelfLevel: 3,
    shelfPosition: 4,
    price: 5.50,
    brand: 'עלית',
    stock: 150
  },
  {
    id: 'p7',
    barcode: '7290100853326',
    name: 'תפוצ\'יפס טבעי עלית שקית משפחתית',
    category: 'חטיפים ומתוקים',
    aisleId: 'A3',
    shelfLevel: 2,
    shelfPosition: 1,
    price: 6.90,
    brand: 'עלית',
    stock: 90
  },
  {
    id: 'p8',
    barcode: '7290000067113',
    name: 'סוכר לבן קלאסי סוגת 1 ק"ג',
    category: 'אפייה ותבלינים',
    aisleId: 'A4',
    shelfLevel: 3,
    shelfPosition: 3,
    price: 4.20,
    brand: 'סוגת',
    stock: 300
  },
  {
    id: 'p9',
    barcode: '7291234567890',
    name: 'קמח חיטה לבן מנופה שטיבל 1 ק"ג',
    category: 'אפייה ותבלינים',
    aisleId: 'A4',
    shelfLevel: 1,
    shelfPosition: 2,
    price: 5.80,
    brand: 'שטיבל',
    stock: 110
  },
  {
    id: 'p10',
    barcode: '7290000041113',
    name: 'חלב תנובה טרי 3% קרטון 1 ליטר',
    category: 'מוצרי חלב',
    aisleId: 'A6',
    shelfLevel: 2,
    shelfPosition: 3,
    price: 6.81,
    brand: 'תנובה',
    stock: 140
  },
  {
    id: 'p11',
    barcode: '7290000042229',
    name: 'גבינה צהובה עמק 28% תנובה 200 גרם',
    category: 'מוצרי חלב',
    aisleId: 'A6',
    shelfLevel: 3,
    shelfPosition: 5,
    price: 14.90,
    brand: 'תנובה',
    stock: 75
  },
  {
    id: 'p12',
    barcode: '7290456123451',
    name: 'קואסון חמאה שוקולד חם מהתנור 4 יח\'',
    category: 'מאפייה',
    aisleId: 'A7',
    shelfLevel: 2,
    shelfPosition: 2,
    price: 12.00,
    brand: 'מאפיית הסניף',
    stock: 30
  },
  {
    id: 'p13',
    barcode: '7290000331122',
    name: 'לחם פרוס כוסמין 100% שופרסל',
    category: 'מאפייה',
    aisleId: 'A7',
    shelfLevel: 1,
    shelfPosition: 1,
    price: 11.50,
    brand: 'שופרסל',
    stock: 25
  },
  {
    id: 'p14',
    barcode: '7290000213121',
    name: 'אפונה ירוקה עדינה סנפרוסט 800 גרם',
    category: 'קפואים',
    aisleId: 'A8',
    shelfLevel: 2,
    shelfPosition: 3,
    price: 16.90,
    brand: 'סנפרוסט',
    stock: 60
  },
  {
    id: 'p15',
    barcode: '5449000000996',
    name: 'קוקה קולה בקבוק משפחתי 1.5 ליטר',
    category: 'משקאות וקלייה',
    aisleId: 'A5',
    shelfLevel: 2,
    shelfPosition: 4,
    price: 7.20,
    brand: 'קוקה קולה',
    stock: 180
  },
  {
    id: 'p16',
    barcode: '7290000114224',
    name: 'מי מינרליים טבעיים נביעות 6 יח\' * 1.5 ליטר',
    category: 'משקאות וקלייה',
    aisleId: 'A5',
    shelfLevel: 1,
    shelfPosition: 1,
    price: 13.50,
    brand: 'נביעות',
    stock: 95
  }
];
