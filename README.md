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

### RAG Agriculture Assistant

The RAG service lives in `rag_system/`. It OCRs the Urdu PDF files from `E:\rag data`, embeds the text with OpenAI embeddings, stores vectors in FAISS, and uses OpenAI for multilingual answers.

```bash
cd rag_system
py -3.11 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python ingest.py --data-dir "E:\rag data" --force-ocr
python app.py
```

The assistant API runs on `http://localhost:8001`.

Frontend features:

- Ask in Urdu, Punjabi, or English
- Get answers in Urdu, Punjabi Shahmukhi, or English
- Listen to answers through browser speech synthesis
- Translate an answer after it is generated
- Prompt login/signup after two AI replies
- Save authenticated chat history in MongoDB through the Node backend

### Web Frontend

The frontend is a Next.js app in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

The disease detection UI calls the FastAPI service at `http://localhost:8000` by default. The assistant calls the RAG service at `http://localhost:8001`.

Optional frontend environment variables:

```env
NEXT_PUBLIC_DISEASE_API_URL=http://localhost:8000
NEXT_PUBLIC_RAG_API_URL=http://localhost:8001
NEXT_PUBLIC_APP_API_URL=http://localhost:5000/api
```

### Node Backend

The Node/Express backend in `backend/` handles:

- Authentication
- Farmer social posts
- Soil data
- Fertilizer recommendations
- Cloudinary uploads
- Saved assistant chat history

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
  rag_system/                OCR + FAISS + OpenAI RAG assistant API
```

## Notes

- The cotton ONNX model is the runtime model for web and mobile backend inference.
- The Keras model should be treated as a training/export artifact.
- For production, restrict FastAPI CORS origins and put authentication/rate limiting in front of public prediction endpoints.
- Keep OpenAI and MongoDB secrets in `.env` files, not in source code.
