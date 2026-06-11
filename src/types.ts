export interface GridCoordinate {
  x: number;
  y: number;
}

export interface StoreAisle {
  id: string; // e.g., "A1", "A2", "A3"
  name: string; // e.g., "מעבר פסטה ושימורים"
  number: number; // e.g., 1, 2, 3
  x: number; // grid x coordinate (0-10)
  y: number; // grid y coordinate (0-10)
  width: number; // grid width
  height: number; // grid height
  shelvesCount: number; // number of shelf levels
  category: string; // e.g., "שימורים", "חומרי ניקוי"
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  aisleId: string; // Reference to StoreAisle.id
  shelfLevel: number; // e.g., 1 to 5 (1 bottom, 5 top)
  shelfPosition: number; // horizontal segment of the aisle (1 to 5)
  price: number;
  brand: string;
  stock: number;
}

export interface PathNode extends GridCoordinate {
  id: string;
  type: 'entrance' | 'checkout' | 'aisle' | 'waypoint';
  label?: string;
}

export interface OptimizedStep {
  productId?: string;
  productName?: string;
  aisleId: string;
  aisleName: string;
  shelfLevel: number;
  shelfPosition: number;
  x: number;
  y: number;
  distance: number;
}
