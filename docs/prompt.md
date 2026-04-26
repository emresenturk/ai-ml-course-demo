Role: You are a Senior Full-Stack AI Engineer. Build a high-fidelity interactive prototype for "Nike Fit Intelligence," a real-time size recommendation service.

1. Front-End Requirements (React/Tailwind):
•
The Product Page: Create a Nike-inspired Product Detail Page (PDP) for a shoe (e.g., Air Jordan 1).



•
The "Fit Prompt": Instead of a static size chart, include a "Find Your Fit" button near the size selector.



• The Recommendation Modal: When clicked, display a modal that shows:
•
The Recommended Size: (e.g., "We recommend Size 10.5").



•
Confidence Score: A visual progress bar showing model confidence (e.g., 85%).



•
The "Why" (GenAI Layer): A plain-language explanation like "Based on your purchase of the Pegasus 40 and reviews saying this model runs narrow, we suggest a half-size up".



• Feedback Loop: A simple "Was this helpful?" (Yes/No) to simulate post-purchase learning.



2. Backend Simulation (Mock Logic):
•
Inference API: Create a mock Fit Decision API that simulates a call to a Vertex AI endpoint.



• Hybrid Logic Layer:
•
Classifer: Use a mock function to simulate a Gradient Boosted Tree selecting a size based on customer_history and product_sku.



•
Rules Engine: Hardcode a safety constraint: If inventory is 0 for the recommended size, fall back to the next best size or show a warning.



•
Explanation Service: Use a mock LLM call to generate the natural language "Why" based on product embeddings (e.g., "runs narrow").



3. Mock Data Structure:
• Provide a JSON object for a "Sample Customer" including:
•
nike_plus_id: 160M+ segment.



•
order_history: 3 past shoe purchases and 1 return for "too small".



•
product_attributes: Silhouette, material, and "runs narrow" tag.



4. Goal: The prototype should demonstrate the "Flywheel" effect—showing how first-party data creates a more personalized experience than a static chart.