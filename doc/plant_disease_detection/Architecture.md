# Plant Disease Detection Architecture

## Stack
- FastAPI
- ONNX Runtime
- Pillow for image processing

## High-level flow
1. FastAPI loads the ONNX model at startup using DiseasePredictor.
2. A prediction request uploads an image file.
3. The image is normalized and resized to 300x300.
4. The model produces class probabilities.
5. The API returns the top prediction and disease metadata.

## Key files
- api/app.py: FastAPI endpoints and startup lifecycle
- src/inference.py: Model loading and prediction logic
- models/cotton_model.onnx: Runtime model
- models/class_mapping.json: Class labels and metadata
