import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    
    # 1. Generate base customer and product features
    historical_true_size = np.random.choice([8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12], size=num_samples)
    shoe_type = np.random.choice(['running', 'lifestyle'], size=num_samples)
    customer_width_preference = np.random.choice(['narrow', 'standard', 'wide'], size=num_samples)
    
    # Customer buys a specific size (could be their true size or half size up/down)
    size_offset = np.random.choice([-0.5, 0.0, 0.5], size=num_samples, p=[0.1, 0.6, 0.3])
    purchased_size = historical_true_size + size_offset
    
    df = pd.DataFrame({
        'historical_true_size': historical_true_size,
        'purchased_size': purchased_size,
        'shoe_type': shoe_type,
        'customer_width': customer_width_preference
    })
    
    # 2. Inject Bias (Rules)
    # Target: is_kept (1 if kept, 0 if returned)
    is_kept = []
    
    for idx, row in df.iterrows():
        offset = row['purchased_size'] - row['historical_true_size']
        
        # Rule 1: 'running' shoes run small. If they bought true size, high return rate. If half size up, high keep rate.
        if row['shoe_type'] == 'running':
            if offset == 0.0:
                prob_keep = 0.30 # 30% keep rate
            elif offset == 0.5:
                prob_keep = 0.95 # 95% keep rate
            else:
                prob_keep = 0.10
        # Rule 2: 'lifestyle' shoes are true to size.
        elif row['shoe_type'] == 'lifestyle':
            if offset == 0.0:
                prob_keep = 0.90
            elif offset == 0.5:
                prob_keep = 0.40
            else:
                prob_keep = 0.20
        else:
            prob_keep = 0.5
            
        kept = np.random.binomial(1, prob_keep)
        is_kept.append(kept)
        
    df['is_kept'] = is_kept
    
    # Encoding categorical
    df['shoe_type_encoded'] = df['shoe_type'].map({'running': 0, 'lifestyle': 1})
    df['customer_width_encoded'] = df['customer_width'].map({'narrow': 0, 'standard': 1, 'wide': 2})
    
    # Target and Features
    X = df[['historical_true_size', 'purchased_size', 'shoe_type_encoded', 'customer_width_encoded']]
    y = df['is_kept']
    
    return X, y, df

if __name__ == "__main__":
    print("Generating synthetic data...")
    X, y, df = generate_synthetic_data(5000)
    df.to_csv("synthetic_transactions.csv", index=False)
    print("Data saved to synthetic_transactions.csv")
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Classifier...")
    model = xgb.XGBClassifier(
        n_estimators=100, 
        learning_rate=0.1, 
        max_depth=3,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Model Accuracy on Test Set: {acc * 100:.2f}%")
    
    # Save the model
    model.save_model("model.json")
    print("Model saved to model.json")
