import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# 1. Load dataset
df = pd.read_json("menu_ml_dataset.json")

print("Dataset loaded:", df.shape)

# 2. Features and target
X = df[["eventType", "category", "selectionCount", "headcount"]]
y = df["selected"]

# 3. Define preprocessing
categorical_cols = ["eventType", "category"]
numerical_cols = ["selectionCount", "headcount"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", "passthrough", numerical_cols)
    ]
)

# 4. Build model pipeline
model = Pipeline([
    ("preprocess", preprocessor),
    ("clf", LogisticRegression(max_iter=1000))
])

# 5. Train-test split (for sanity check)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 6. Train
model.fit(X_train, y_train)

# 7. Accuracy check
accuracy = model.score(X_test, y_test)
print("Model Accuracy:", accuracy)

# 8. Save model
joblib.dump(model, "menu_model.pkl")
print("Model saved as menu_model.pkl")