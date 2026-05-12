# AgriSense AI

AgriSense AI is a smart agriculture platform that combines crop disease detection, soil monitoring, fertilizer recommendations, an assistant interface, and a farmer social feed.

## Current Modules

### Cotton Leaf Disease Detection

The disease detection backend now uses the cotton model exported as ONNX:

- Model: `plant_disease_detection/models/cotton_model.onnx`
- Runtime: FastAPI + ONNX Runtime
- Architecture: EfficientNetB3 export
- Input size: `300x300x3`
- Classes: 7 cotton leaf classes

Detectable classes:

1. Bacterial Blight
2. Curl Virus
3. Healthy Leaf
4. Herbicide Growth Damage
5. Leaf Hopper Jassids
6. Leaf Redding
7. Leaf Variegation

The `.onnx` model is preferred for the backend because it is smaller than the `.keras` file and avoids the full TensorFlow runtime during API inference. Keep the `.keras` model for retraining or future exports.

Start the API:

```bash
cd plant_disease_detection
pip install -r requirements.txt
python api/app.py
```

Endpoints:

- `GET /health`
- `GET /classes`
- `POST /predict`
- `POST /predict/batch`
- `GET /disease-info/{name}`

### Web Frontend

The frontend is a Next.js app in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

The disease detection UI calls the FastAPI service at `http://localhost:8000` by default. Set `NEXT_PUBLIC_API_URL` if the API is hosted elsewhere.

### Node Backend

The Node/Express backend in `backend/` handles:

- Authentication
- Farmer social posts
- Soil data
- Fertilizer recommendations
- Cloudinary uploads

```bash
cd backend
npm install
npm run dev
```

## Project Structure

```text
AgriSense/
  backend/                   Express API for auth, posts, soil, upload
  frontend/                  Next.js web app
  plant_disease_detection/   FastAPI + ONNX cotton disease detection API
```

## Notes

- The cotton ONNX model is the runtime model for web and mobile backend inference.
- The Keras model should be treated as a training/export artifact.
- For production, restrict FastAPI CORS origins and put authentication/rate limiting in front of public prediction endpoints.
