from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import xgboost as xgb
import numpy as np
from sentence_transformers import SentenceTransformer, util
import os

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Vite local server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Global Models and Data
# ---------------------------------------------------------
xgb_model = xgb.XGBClassifier()
if os.path.exists("model.json"):
    xgb_model.load_model("model.json")
else:
    print("WARNING: model.json not found. Did you run generate_data.py?")

# Load Sentence Transformer (Layer 2)
print("Loading sentence transformer (this may take a moment on first run)...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Mock catalog descriptions for Layer 2
CATALOG_DESCRIPTIONS = {
    "PRD-AJ1-001": "Familiar but always fresh, the iconic Air Jordan 1 is remastered. This silhouette features a rigid leather upper that runs slightly narrow across the toe box.",
    "PRD-PEG-039": "The Pegasus 39 is a standard daily trainer. It has a forgiving mesh upper and fits true to size for most runners.",
    "PRD-AF1-000": "The classic Air Force 1. Known for a roomy toe box, many prefer to go half a size down."
}
# Pre-compute embeddings for the catalog
catalog_embeddings = {k: embedder.encode(v, convert_to_tensor=True) for k, v in CATALOG_DESCRIPTIONS.items()}


# ---------------------------------------------------------
# API Models
# ---------------------------------------------------------
class Order(BaseModel):
    id: str
    product_name: str
    silhouette: str
    size: float
    status: str
    return_reason: Optional[str] = None

class CustomerData(BaseModel):
    nike_plus_id: str
    segment: str
    order_history: List[Order]

class ProductAttributes(BaseModel):
    id: str
    name: str
    silhouette: str
    material: str
    tags: List[str]
    inventory: Dict[str, int] # size -> count

class RecommendRequest(BaseModel):
    customer: CustomerData
    product: ProductAttributes


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------
@app.post("/api/recommend")
async def recommend_size(req: RecommendRequest):
    customer = req.customer
    product = req.product
    
    # ---------------------------------------------------------
    # Layer 1: XGBoost Classification
    # ---------------------------------------------------------
    # Determine historical true size (average of kept shoes, rounded to nearest 0.5)
    kept_sizes = [o.size for o in customer.order_history if o.status == 'kept']
    if kept_sizes:
        raw_avg = sum(kept_sizes) / len(kept_sizes)
        historical_true_size = round(raw_avg * 2) / 2.0
    else:
        historical_true_size = 10.0
    
    # Encode shoe type (0 = running, 1 = lifestyle)
    shoe_type_encoded = 0 if 'running' in product.silhouette.lower() else 1
    # Assume standard width for simplicity
    width_encoded = 1 
    
    # We want to test a few possible sizes for this customer
    sizes_to_test = [historical_true_size - 0.5, historical_true_size, historical_true_size + 0.5]
    
    best_prob = 0
    best_size = historical_true_size
    
    # If the model is loaded, predict probabilities
    if os.path.exists("model.json"):
        print("Predicting with XGBoost model...")
        features = np.array([[historical_true_size, s, shoe_type_encoded, width_encoded] for s in sizes_to_test])
        probs = xgb_model.predict_proba(features)[:, 1] # Probability of 'kept' (class 1)
        
        best_idx = np.argmax(probs)
        best_prob = probs[best_idx]
        best_size = sizes_to_test[best_idx]
    else:
        # Fallback if no model
        best_prob = 0.85
        best_size = historical_true_size + 0.5 if shoe_type_encoded == 0 else historical_true_size
        
    confidence_score = int(best_prob * 100)


    # ---------------------------------------------------------
    # Layer 2: Semantic Text Embeddings
    # ---------------------------------------------------------
    # Get current product embedding (fallback to a generic description if not in dict)
    desc = CATALOG_DESCRIPTIONS.get(product.id, "A standard athletic shoe.")
    curr_emb = embedder.encode(desc, convert_to_tensor=True)
    
    # We could compare against their kept history if we had descriptions for them.
    # For this prototype, we'll extract the key "fit signal" directly from the description text.
    runs_narrow = "narrow" in desc.lower()


    # ---------------------------------------------------------
    # Layer 3: Rules Guardrails
    # ---------------------------------------------------------
    recommended_size = best_size
    fallback_size = None
    inventory_warning = False
    
    # Check inventory (the frontend sends keys as strings, e.g., "10.5")
    size_str = str(recommended_size)
    # Removing trailing .0 for integer sizes like "10"
    if size_str.endswith(".0"):
        size_str = size_str[:-2]
        
    if product.inventory.get(size_str, 0) == 0:
        inventory_warning = True
        fallback_size = recommended_size
        # Fallback to nearest size (+0.5)
        recommended_size += 0.5


    # ---------------------------------------------------------
    # Layer 4: GenAI Explanation Simulation
    # ---------------------------------------------------------
    # Constructing the dynamic prompt we would send to an LLM
    genai_prompt = f"""
    You are the Nike Fit Intelligence AI.
    Customer History: True size {historical_true_size}, returned previous narrow shoe.
    Product: {product.name}. Description: {desc}
    Algorithm Recommended Size: {recommended_size}
    Confidence: {confidence_score}%
    
    Write a 1-sentence explanation for the customer.
    """
    
    print("\n--- [SIMULATED LAYER 4: GENAI PROMPT] ---")
    print(genai_prompt)
    print("-----------------------------------------\n")
    
    # Simulated Response
    explanation = f"Based on your purchase history and reviews noting this silhouette runs slightly narrow, we recommend sizing up to {recommended_size}."
    if inventory_warning:
        explanation += f" (Note: Your true recommended size {fallback_size} is out of stock)."

    return {
        "recommended_size": recommended_size,
        "fallback_size": fallback_size,
        "confidence_score": confidence_score,
        "explanation": explanation,
        "inventory_warning": inventory_warning
    }
