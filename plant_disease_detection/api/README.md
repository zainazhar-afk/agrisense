# AgriSense AI - Cotton Leaf Disease Detection API

FastAPI backend for cotton leaf disease detection using the ONNX export of the EfficientNetB3 cotton model.

## Why ONNX

This API uses `cotton_model.onnx` instead of `cotton_model.keras` because ONNX is smaller, starts faster, and runs with `onnxruntime` without loading the full TensorFlow stack. Keep the `.keras` model for retraining or future exports.

## Quick Start

```bash
cd plant_disease_detection
pip install -r requirements.txt
python api/app.py
```

The API runs at:

- API base: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Model Files

- Runtime model: `models/cotton_model.onnx`
- Class mapping: `models/class_mapping.json`
- Input shape: `300x300x3`
- Output classes: `7`

## Classes

1. Bacterial Blight
2. Curl Virus
3. Healthy Leaf
4. Herbicide Growth Damage
5. Leaf Hopper Jassids
6. Leaf Redding
7. Leaf Variegation

## Endpoints

- `GET /health` - Check API and model status
- `GET /classes` - List detectable cotton classes
- `POST /predict` - Predict disease from one image
- `POST /predict/batch` - Predict disease from up to 10 images
- `GET /disease-info/{name}` - Get symptoms, treatment, and prevention details

## Test

```bash
python api/test_api.py path/to/cotton_leaf.jpg
```
