# Nike Fit Intelligence Prototype

A high-fidelity prototype demonstrating an AI-driven fit recommendation system. This project integrates a production-grade Python/FastAPI machine learning backend with a dynamic React frontend to provide real-time, personalized shoe size recommendations.

## 🏗️ Architecture

The system is composed of two main services:

1. **Backend (`/backend`)**: A robust ML service built with FastAPI.
   - **Layer 1:** Uses XGBoost classification to predict the likelihood of a customer keeping a specific shoe size based on their purchase history, shoe type, and width preferences.
   - **Layer 2:** Utilizes Sentence Transformers (`all-MiniLM-L6-v2`) for semantic text embeddings to match product descriptions with customer fit signals.
   - **Layer 3:** A rules engine to handle edge cases like out-of-stock inventory, providing fallback recommendations.
   - **Layer 4:** Simulated GenAI for natural language explanations on *why* a certain size was recommended.

2. **Frontend (`/nike-fit-prototype`)**: A dynamic React/Vite application.
   - Built with modern React and styled using Tailwind CSS.
   - Provides a multi-product browsing experience, customer profile overview, and dynamic fit recommendations hooked up directly to the backend API.

## 🚀 Getting Started

The easiest way to get everything up and running is to use Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (comes bundled with Docker Desktop).

### Running the Application

1. Open your terminal and navigate to the root of this repository.
2. Run the following command to build the images and start the services:

   ```bash
   docker compose up --build
   ```

   *(Note: The first time you run this, it may take a few minutes as it downloads the Python and Node.js base images, installs dependencies, and downloads the Sentence Transformer model).*

3. Once the containers are running, you can access the application at:
   - **Frontend UI:** [http://localhost:5173](http://localhost:5173)
   - **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

To stop the application, simply press `Ctrl + C` in the terminal, or run:
```bash
docker compose down
```

## 🛠️ Development

If you'd like to develop or test the services individually without Docker, you can run them directly on your host machine.

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the backend dev server
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd nike-fit-prototype
npm install

# Run the Vite dev server
npm run dev
```

## 📊 Synthetic Data

The backend includes a script `generate_data.py` which generated the initial synthetic transaction data and trained the XGBoost classifier (`model.json`). If you wish to retrain the model, you can run this script directly within the backend directory.
