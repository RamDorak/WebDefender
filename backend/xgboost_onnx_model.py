import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from scipy.io import arff
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import joblib
import onnx
import onnxmltools
from skl2onnx.common.data_types import FloatTensorType

# ---------------------------------------------------------
# ✅ Step 1: Load & Preprocess Data
# ---------------------------------------------------------

# Load ARFF dataset
data, meta = arff.loadarff('phishing_dataset.arff')

# Convert ARFF to DataFrame
data = pd.DataFrame(data)

# Convert binary attributes to integers
data = data.map(lambda x: int(x) if isinstance(x, (bytes, str)) else x)

# Convert target variable -1 to 0 to fit binary classification
data['Result'] = data['Result'].replace(-1, 0)

# Drop unnecessary columns to optimize model
unnecessary_columns = [
    'double_slash_redirecting', 'Favicon', 'port', 'Redirect', 'Page_Rank'
]
data = data.drop(unnecessary_columns, axis=1)

# Split data
X = data.drop('Result', axis=1)
y = data['Result']

# Split into training/testing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ✅ Rename features to numeric names
X_train.columns = [f"f{i}" for i in range(X_train.shape[1])]
X_test.columns = X_train.columns  # Ensure test data has the same feature names

# ---------------------------------------------------------
# ✅ Step 2: Train XGBoost Model
# ---------------------------------------------------------

# Initialize XGBoost model
xgb_model = XGBClassifier(
    max_depth=6,
    learning_rate=0.1,
    n_estimators=100,
    objective='binary:logistic',
    eval_metric='logloss'
)

# Train the model
xgb_model.fit(X_train, y_train)

# Predict on test data
y_pred = xgb_model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f'✅ XGBoost Model Accuracy: {accuracy * 100:.2f}%')

# Save the original XGBoost model
joblib.dump(xgb_model, 'phishing_model_xgb.pkl')

# ---------------------------------------------------------
# ✅ Step 3: Convert XGBoost to ONNX
# ---------------------------------------------------------

print("🚀 Converting XGBoost to ONNX...")

# Define the ONNX model input type
initial_type = [('input', FloatTensorType([None, X_train.shape[1]]))]

# Convert the XGBoost model to ONNX
onnx_model = onnxmltools.convert_xgboost(xgb_model, initial_types=initial_type)

# Save the ONNX model
onnxmltools.utils.save_model(onnx_model, "phishing_model.onnx")
print("✅ XGBoost model successfully converted to ONNX!")
