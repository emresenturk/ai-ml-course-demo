// Mock Backend Service mimicking Vertex AI / Fit Decision API

export interface Order {
  id: string;
  product_name: string;
  silhouette: string;
  size: number;
  status: 'kept' | 'returned';
  return_reason?: string;
}

export interface CustomerData {
  nike_plus_id: string;
  segment: string;
  order_history: Order[];
}

export interface ProductAttributes {
  id: string;
  name: string;
  silhouette: string;
  material: string;
  tags: string[];
  inventory: Record<number, number>; // size -> count
  images: string[];
  price: number;
}

export interface RecommendationResponse {
  recommended_size: number;
  fallback_size?: number;
  confidence_score: number; // 0 to 100
  explanation: string;
  inventory_warning?: boolean;
}

// 3. Mock Data Structure
export const SAMPLE_CUSTOMER: CustomerData = {
  nike_plus_id: 'USR-160M-9921',
  segment: '160M+',
  order_history: [
    { id: 'ORD-1', product_name: 'Nike Air Zoom Pegasus 39', silhouette: 'Running', size: 11, status: 'kept' },
    { id: 'ORD-2', product_name: 'Nike Air Max 270', silhouette: 'Lifestyle', size: 11, status: 'kept' },
    { id: 'ORD-3', product_name: 'Nike React Infinity Run Flyknit 3', silhouette: 'Running', size: 11, status: 'kept' },
    { id: 'ORD-4', product_name: 'Nike Air Force 1', silhouette: 'Lifestyle', size: 10, status: 'returned', return_reason: 'too small' },
  ],
};

export const CATALOG_PRODUCTS: ProductAttributes[] = [
  {
    id: 'PRD-AJ1-001',
    name: 'Air Jordan 1 Retro High OG',
    silhouette: 'Lifestyle High-Top',
    material: 'Leather',
    tags: ['runs narrow', 'snug fit', 'classic'],
    images: ['https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-jordan-1-retro-high-og-shoes.png'],
    price: 180,
    inventory: {
      7: 5, 7.5: 5, 8: 5, 8.5: 5, 9: 12, 9.5: 5,
      10: 0, // Out of stock for size 10 to trigger the Rules Engine
      10.5: 8, 11: 15, 11.5: 10, 12: 12, 12.5: 10, 13: 5
    },
  },
  {
    id: 'PRD-PEG-039',
    name: 'Nike Air Zoom Pegasus 39',
    silhouette: 'Running',
    material: 'Mesh',
    tags: ['true to size', 'breathable', 'daily trainer'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80'],
    price: 130,
    inventory: {
      7: 15, 7.5: 15, 8: 20, 8.5: 20, 9: 25, 9.5: 30,
      10: 30, 10.5: 25, 11: 20, 11.5: 15, 12: 10, 12.5: 5, 13: 5
    },
  },
  {
    id: 'PRD-AF1-000',
    name: "Nike Air Force 1 '07",
    silhouette: 'Lifestyle',
    material: 'Leather',
    tags: ['runs large', 'wide toe box', 'classic'],
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1000&q=80'],
    price: 110,
    inventory: {
      7: 10, 7.5: 10, 8: 15, 8.5: 15, 9: 20, 9.5: 20,
      10: 20, 10.5: 15, 11: 15, 11.5: 10, 12: 10, 12.5: 5, 13: 5
    },
  }
];

// 2. Hybrid Logic Layer
const simulateClassifier = (customer: CustomerData, product: ProductAttributes): { size: number; confidence: number } => {
  // Mock Gradient Boosted Tree selecting size based on history and SKU
  // Customer usually buys size 10. They returned AF1 in size 10 for being "too small".
  // Product tags include "runs narrow".
  // The classifier logically predicts a half-size up (10.5).
  return { size: 10.5, confidence: 88 };
};

const simulateRulesEngine = (recommendedSize: number, product: ProductAttributes): { finalSize: number; warning: boolean; fallback?: number } => {
  // Hardcoded safety constraint: If inventory is 0, fall back to next best size or show warning.
  if (product.inventory[recommendedSize] === 0) {
    // If 10.5 was recommended but out of stock, fallback to 11.
    // In our mock, 10.5 is in stock (8), but let's test the logic.
    return { finalSize: recommendedSize + 0.5, warning: true, fallback: recommendedSize };
  }
  return { finalSize: recommendedSize, warning: false };
};

const simulateExplanationService = (customer: CustomerData, product: ProductAttributes, recommendedSize: number): string => {
  // Mock LLM call generating natural language "Why" based on embeddings/tags
  const recentPurchases = customer.order_history.filter((o) => o.status === 'kept').map((o) => o.product_name);
  const narrowTag = product.tags.includes('runs narrow');

  if (narrowTag) {
    return `Based on your purchase of the ${recentPurchases[0]} and reviews saying this model runs narrow, we suggest a half-size up to a ${recommendedSize}.`;
  }
  return `Based on your purchase history and this product's fit profile, we recommend a size ${recommendedSize}.`;
};

// Real Inference API (Calling Python/FastAPI Backend)
export const getFitRecommendation = async (
  customer: CustomerData,
  product: ProductAttributes
): Promise<RecommendationResponse> => {
  try {
    const response = await fetch('http://localhost:8000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer, product }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch recommendation:", error);
    // Fallback if backend is down
    return {
      recommended_size: 10,
      confidence_score: 0,
      explanation: "Unable to reach Nike Fit Intelligence servers.",
      inventory_warning: false
    };
  }
};

export const AVAILABLE_PRODUCTS = [
  { name: 'Nike Air Zoom Pegasus 39', silhouette: 'Running' },
  { name: 'Nike React Infinity Run Flyknit 3', silhouette: 'Running' },
  { name: 'Nike Air Max 270', silhouette: 'Lifestyle' },
  { name: 'Nike Air Force 1', silhouette: 'Lifestyle' },
  { name: 'Air Jordan 1 Retro High OG', silhouette: 'Lifestyle High-Top' },
  { name: 'Nike Dunk Low', silhouette: 'Lifestyle' }
];
