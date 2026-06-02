# Plant Disease Detection Manual

## Purpose
This service detects cotton leaf diseases using an ONNX model and exposes a REST API for predictions.

## Typical usage
1. Start the API server.
2. Open the Swagger UI at http://localhost:8000/docs.
3. Use POST /predict with an image file.
4. Review top predictions and disease info.

## Image guidance
- Use clear, well-lit images of a single leaf.
- Avoid extreme angles and excessive blur.
- JPEG or PNG formats are recommended.

## Notes
- If the model is missing or fails to load, /health returns degraded and predictions return 503.
