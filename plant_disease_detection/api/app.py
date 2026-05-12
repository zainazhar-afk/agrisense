"""
FastAPI application for cotton leaf disease detection.
"""
import io
import sys
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from src.inference import DiseasePredictor


app = FastAPI(
    title="AgriSense AI - Cotton Leaf Disease Detection API",
    description="AI-powered cotton leaf disease detection using an EfficientNetB3 ONNX model",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to your frontend/mobile domains in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = None


class PredictionResponse(BaseModel):
    """Response model for disease prediction."""

    success: bool
    message: str
    data: Optional[dict] = None


class HealthResponse(BaseModel):
    """Response model for health check."""

    status: str
    message: str
    model_loaded: bool
    num_classes: int
    model_format: str


@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup."""
    global predictor
    try:
        print("Initializing cotton leaf disease detection model...")
        predictor = DiseasePredictor()
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise


@app.get("/", response_model=dict)
async def root():
    """Root endpoint."""
    return {
        "message": "AgriSense AI - Cotton Leaf Disease Detection API",
        "version": "1.0.0",
        "model_format": "ONNX",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "predict_batch": "/predict/batch",
            "classes": "/classes",
            "disease_info": "/disease-info/{disease_name}",
            "docs": "/docs",
        },
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "API is running",
        "model_loaded": predictor is not None,
        "num_classes": len(predictor.class_names) if predictor else 0,
        "model_format": "ONNX",
    }


@app.get("/classes", response_model=dict)
async def get_classes():
    """Get all detectable cotton disease classes."""
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    return {
        "success": True,
        "num_classes": len(predictor.class_names),
        "classes": predictor.class_names,
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_disease(file: UploadFile = File(...), top_k: int = 3):
    """
    Predict cotton leaf disease from an uploaded image.

    Args:
        file: Image file (JPEG, PNG, WebP, etc.)
        top_k: Number of top predictions to return.
    """
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Please upload an image.",
        )

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        result = predictor.predict(image, top_k=top_k)

        return {
            "success": True,
            "message": "Prediction successful",
            "data": {
                "filename": file.filename,
                "top_prediction": result["top_prediction"],
                "all_predictions": result["predictions"],
                "disease_info": result["disease_info"],
            },
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}",
        )


@app.post("/predict/batch", response_model=PredictionResponse)
async def predict_batch(files: List[UploadFile] = File(...), top_k: int = 3):
    """Predict cotton leaf disease for up to 10 uploaded images."""
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    if len(files) > 10:
        raise HTTPException(
            status_code=400,
            detail="Maximum 10 images allowed per batch",
        )

    results = []
    for file in files:
        try:
            if not file.content_type or not file.content_type.startswith("image/"):
                raise ValueError(f"Invalid file type: {file.content_type}")

            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            result = predictor.predict(image, top_k=top_k)

            results.append({
                "filename": file.filename,
                "success": True,
                "prediction": result["top_prediction"],
                "all_predictions": result["predictions"],
                "disease_info": result["disease_info"],
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e),
            })

    return {
        "success": True,
        "message": f"Processed {len(files)} images",
        "data": {
            "total_images": len(files),
            "results": results,
        },
    }


@app.get("/disease-info/{disease_name}", response_model=dict)
async def get_disease_info(disease_name: str):
    """Get detailed information about a specific cotton disease class."""
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    if disease_name not in predictor.class_names:
        raise HTTPException(
            status_code=404,
            detail=f"Disease '{disease_name}' not found. Available classes: {predictor.class_names}",
        )

    return {
        "success": True,
        "disease": disease_name,
        "info": predictor._get_disease_info(disease_name),
    }


if __name__ == "__main__":
    import uvicorn

    print("=" * 80)
    print("AgriSense AI - Cotton Leaf Disease Detection API")
    print("=" * 80)
    print("\nStarting server...")
    print("  - API: http://localhost:8000")
    print("  - Docs: http://localhost:8000/docs")
    print("  - ReDoc: http://localhost:8000/redoc")
    print("\nPress Ctrl+C to stop\n")

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
