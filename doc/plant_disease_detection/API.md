# Plant Disease Detection API

## Base URL
Default local base URL: http://localhost:8000

## Endpoints

### GET /
Returns API metadata and available endpoints.

### GET /health
Returns model status and readiness.

### GET /classes
Returns all supported cotton disease classes.

### POST /predict
Predict disease from a single image.

Request (multipart/form-data):
- file: image file
- top_k: optional query parameter (default 3)

Response (200):

```
{
  "success": true,
  "message": "Prediction successful",
  "data": {
    "filename": "leaf.jpg",
    "top_prediction": { "label": "Healthy Leaf", "confidence": 0.95 },
    "all_predictions": [ { "label": "Healthy Leaf", "confidence": 0.95 } ],
    "disease_info": { "symptoms": "...", "treatment": "...", "prevention": "..." }
  }
}
```

### POST /predict/batch
Predict disease for up to 10 images.

Request (multipart/form-data):
- files: up to 10 image files
- top_k: optional query parameter

### GET /disease-info/{disease_name}
Returns details for one disease class.

## Errors
- 400: invalid file type or batch size > 10
- 503: model not loaded
- 500: image processing error
