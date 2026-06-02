# Plant Disease Detection Deployment

## Production run (Uvicorn)

```
cd plant_disease_detection
.venv\Scripts\activate
uvicorn api.app:app --host 0.0.0.0 --port 8000
```

## Notes
- Restrict CORS origins in production.
- Ensure models/cotton_model.onnx is packaged with the deployment.
- For scaling, run behind a reverse proxy and increase worker count.
