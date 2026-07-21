# DefectSense: Software Defect Prediction System

> **A production-ready Software Defect Prediction (SDP) platform** powered by PyTorch TabNet and SMOTE, featuring a glassmorphic React dashboard for real-time module-level defect diagnostics.

---

## 📌 Overview

DefectSense is an end-to-end system that predicts software defects from code-level metrics. It was built for the **CM1 dataset** from NASA's software metrics repository, which contains McCabe complexity metrics, Halstead effort metrics, and lines-of-code measurements for individual software modules.

The system combines:
- **PyTorch TabNet** — An attention-based deep learning model designed for tabular data, providing both high accuracy and built-in feature interpretability.
- **SMOTE** (Synthetic Minority Over-sampling Technique) — Addresses the severe class imbalance inherent in defect datasets (typically ~90% non-defective).
- **A glassmorphic React dashboard** — Provides a professional-grade, dark-themed command console UI for uploading data and reviewing results.

---

## 🚀 How the System Works

### 1. Data Ingestion & Preprocessing

When a user uploads a CSV file through the dashboard:

1. **Target Detection**: The backend automatically identifies the target/label column from common names (`Defective`, `defects`, `label`, `class`, etc.), falling back to the last column if none match.
2. **Label Normalization**: Boolean and string labels (`true/false`, `Y/N`, `yes/no`) are mapped to binary integers `0` (non-defective) and `1` (defective).
3. **Missing Value Imputation**: Any missing numeric values are filled using **median imputation** — chosen over mean imputation for robustness against outliers common in software metrics.

### 2. Train/Test Split

The data is split **80/20** with stratified sampling (`stratify=y`) to preserve the original class distribution in both sets. A fixed random seed (`SEED=42`) ensures reproducible results.

### 3. Feature Scaling

A `StandardScaler` normalizes all features to zero mean and unit variance. This is critical for TabNet's attention mechanism to weigh features fairly regardless of their native scales (e.g., LOC ranges in hundreds while cyclomatic complexity stays single-digit).

### 4. SMOTE Oversampling

Software defect datasets are notoriously imbalanced. For instance, the CM1 dataset has roughly:
- **~449 non-defective** modules
- **~49 defective** modules

SMOTE generates **synthetic minority samples** by interpolating between existing defective modules in feature space. After SMOTE, both classes have equal representation, preventing the model from learning to simply predict "non-defective" for everything.

### 5. TabNet Training & Inference

The model architecture uses:
| Parameter | Value | Purpose |
|-----------|-------|---------|
| `n_d` | 8 | Width of the prediction layer |
| `n_a` | 8 | Width of the attention layer |
| `n_steps` | 3 | Number of sequential attention steps |
| `gamma` | 1.3 | Coefficient for feature reusage in attention |
| `max_epochs` | 50 | Maximum training epochs |
| `patience` | 10 | Early stopping patience |

TabNet's key advantage is its **attention mechanism**: at each step, the model selects a subset of features to focus on, producing interpretable **feature importance scores** as a byproduct of training — no separate explainability tool needed.

If a pre-trained model (`saved_tabnet_model.zip`) exists and its features match the uploaded data, the system **loads it directly** instead of retraining, dramatically reducing inference time.

### 6. Evaluation Metrics

The system computes on the test set:
- **Accuracy** — Overall correctness
- **Precision** — Of predicted defectives, how many are truly defective
- **Recall** — Of truly defective modules, how many were caught
- **F1-Score** — Harmonic mean of precision and recall
- **Confusion Matrix** — TN, FP, FN, TP breakdown

### 7. Diagnostic Reasoning Engine

This is the system's most distinctive feature. For **every module** in the test set, the engine generates a human-readable diagnostic explanation:

**For Defective modules:**
- Identifies the **top 3 most anomalous features** by calculating Z-scores against the training set mean.
- Reports the actual value, the training average, and the deviation magnitude (e.g., `loc=120.5 (above avg 50.2, z=2.5σ)`).
- Highlights which of the top-5 model-important features are among the anomalies.
- Recommends code review and targeted testing.

**For Non-Defective modules:**
- Reports the **3 features closest to baseline** (lowest Z-scores), confirming the module's metrics fall within healthy operational thresholds.
- Flags any **borderline metrics** (z > 1.5σ) that may warrant monitoring in future iterations.
- Confirms the module passes McCabe complexity, Halstead volume, and LOC quality checks.

### 8. Interactive Dashboard

The React frontend renders the complete analysis through:

| Component | Description |
|-----------|-------------|
| **Command Console** | Upload zone styled as a hex-dump data ingestion port |
| **Metrics Cards** | Total modules, predicted defective/clean counts, recall/F1 |
| **Module Table** | Per-module predictions with confidence bars and reasoning |
| **Class Distribution Chart** | Before/after SMOTE bar comparison |
| **Feature Importance Chart** | Horizontal bars ranked by TabNet attention weights |
| **Confusion Matrix** | Color-coded 2×2 grid (TN/FP/FN/TP) |
| **SMOTE Balancing Panel** | Before/after percentage comparison with synthetic count |
| **Diagnostic Panel** | Full reasoning cards for each module |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **ML Framework** | PyTorch TabNet |
| **Data Balancing** | Imbalanced-Learn (SMOTE) |
| **Data Processing** | Pandas, NumPy, Scikit-Learn |
| **Backend API** | Flask, Flask-CORS |
| **Production Server** | Gunicorn |
| **Frontend** | React 19, Vite |
| **Styling** | TailwindCSS v4 (glassmorphic dark theme) |
| **Hosting** | Render |

---

## 📁 Project Structure

```
software-def/
├── app.py                      # Flask backend — API + static file serving
├── requirements.txt            # Python dependencies
├── build.sh                    # Render build script
├── render.yaml                 # Render deployment blueprint
├── cm1.csv                     # NASA CM1 software metrics dataset
├── saved_tabnet_model.zip      # Pre-trained TabNet model weights
├── scaler.pkl                  # Fitted StandardScaler
├── feature_importances.pkl     # Cached feature importance scores
├── SDP_TabNet_SMOTE_CM1.ipynb  # Research notebook (training pipeline)
├── README.md
├── .gitignore
└── dashboard/                  # React frontend
    ├── src/
    │   ├── App.jsx             # Main application component
    │   ├── App.css             # Component styles
    │   ├── index.css           # Global styles (glassmorphic theme)
    │   └── main.jsx            # React entry point
    ├── index.html              # HTML shell
    ├── vite.config.js          # Vite config (dev proxy to Flask)
    ├── package.json
    └── tailwind.config.js
```

---

## ⚙️ Running Locally

### Prerequisites
- Python 3.8+
- Node.js 18+

### 1. Start the Backend
```bash
pip install -r requirements.txt
python app.py
```
The backend runs on `http://localhost:5000`.

### 2. Start the Frontend (Development)
```bash
cd dashboard
npm install
npm run dev
```
The dev server runs on `http://localhost:5173` with API requests proxied to the Flask backend.

### 3. Production Build (Single Server)
```bash
cd dashboard && npm run build && cd ..
python app.py
```
Visit `http://localhost:5000` — Flask serves both the API and the built React app.

---

## 🌐 Deploying to Render

1. Push this repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Web Service**.
3. Connect your GitHub repo (`x1-x2160/software_def`).
4. Render will auto-detect `render.yaml` and configure:
   - **Build Command**: `./build.sh` (installs Python deps + builds React)
   - **Start Command**: `gunicorn app:app`
5. Click **Create Web Service** and wait for the build to complete.

---

## 📊 Dataset: CM1

The CM1 dataset from NASA contains **498 modules** with **21 software metrics** and a binary defect label. Key features include:

| Feature Category | Metrics |
|-----------------|---------|
| **McCabe Complexity** | `loc_total`, `v(g)`, `ev(g)`, `iv(g)` |
| **Halstead Metrics** | `n`, `v`, `l`, `d`, `i`, `e`, `b`, `t` |
| **Lines of Code** | `lOCode`, `lOComment`, `lOBlank`, `locCodeAndComment` |
| **Branch Count** | `branchCount`, `uniq_Op`, `uniq_Opnd`, `total_Op`, `total_Opnd` |

---

## 👥 Developers

- **ABIOLA AKOREDE**
- **AYINDE MUHAMMAD ABDULWADUD**
- **ABDUL-RASHEED ADENIYI BABALOLA**

---

## 📄 License

This project was developed for academic purposes (CSC420 — Software Engineering).
