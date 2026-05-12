"""
Inference utilities for cotton leaf disease detection.
"""
import json
import sys
from pathlib import Path
from typing import Dict

import numpy as np
import onnxruntime as ort
from PIL import Image

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
import config


class DiseasePredictor:
    """Cotton leaf disease prediction class backed by ONNX Runtime."""

    def __init__(self, model_path: Path = None, class_mapping_path: Path = None):
        self.model_path = model_path or config.MODEL_ONNX_PATH
        self.class_mapping_path = class_mapping_path or config.CLASS_MAPPING_PATH

        self.session = None
        self.input_name = None
        self.output_name = None
        self.class_mapping = None
        self.class_names = []

        self._load_model()
        self._load_class_mapping()

    def _load_model(self):
        """Load the trained ONNX model."""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model not found at {self.model_path}")

        print(f"Loading ONNX model from {self.model_path}...")
        self.session = ort.InferenceSession(
            str(self.model_path),
            providers=["CPUExecutionProvider"],
        )
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        print("Model loaded successfully")

    def _load_class_mapping(self):
        """Load class mapping."""
        if not self.class_mapping_path.exists():
            raise FileNotFoundError(f"Class mapping not found at {self.class_mapping_path}")

        with open(self.class_mapping_path, "r", encoding="utf-8") as f:
            self.class_mapping = json.load(f)

        self.class_names = self.class_mapping["class_names"]
        print(f"Loaded {len(self.class_names)} cotton disease classes")

    def preprocess_image(self, image_input) -> np.ndarray:
        """
        Preprocess image for ONNX model prediction.

        The cotton model was exported from EfficientNetB3 with preprocessing layers
        inside the model, so the API sends RGB float32 pixels in the 0-255 range.
        """
        if isinstance(image_input, (str, Path)):
            pil_image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, np.ndarray):
            pil_image = Image.fromarray(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            pil_image = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        pil_image = pil_image.resize(config.IMAGE_SIZE)
        image_array = np.array(pil_image, dtype=np.float32)
        return np.expand_dims(image_array, axis=0)

    def predict(self, image_input, top_k: int = 3) -> Dict:
        """
        Predict cotton leaf disease from an image.

        Args:
            image_input: Image to predict (file path, PIL Image, or numpy array)
            top_k: Number of top predictions to return

        Returns:
            Dictionary with prediction results.
        """
        processed_image = self.preprocess_image(image_input)
        raw_output = self.session.run(
            [self.output_name],
            {self.input_name: processed_image},
        )[0][0]

        probabilities = self._softmax_if_needed(raw_output)
        top_k = min(top_k, len(self.class_names))
        top_indices = np.argsort(probabilities)[-top_k:][::-1]

        predictions = []
        for idx in top_indices:
            class_name = self.class_names[int(idx)]
            confidence = float(probabilities[idx])
            predictions.append({
                "disease": class_name,
                "confidence": confidence,
                "confidence_percent": f"{confidence * 100:.2f}%",
            })

        top_prediction = predictions[0]
        return {
            "predictions": predictions,
            "top_prediction": top_prediction,
            "disease_info": self._get_disease_info(top_prediction["disease"]),
        }

    @staticmethod
    def _softmax_if_needed(values: np.ndarray) -> np.ndarray:
        """Return probabilities whether the model emits logits or softmax scores."""
        values = values.astype(np.float32)
        total = float(np.sum(values))
        if np.all(values >= 0) and np.isclose(total, 1.0, atol=1e-3):
            return values

        values = values - np.max(values)
        exp_values = np.exp(values)
        return exp_values / np.sum(exp_values)

    def _get_disease_info(self, disease_name: str) -> Dict:
        """Get information about the cotton leaf disease."""
        disease_db = {
            "Bacterial Blight": {
                "scientific_name": "Xanthomonas citri pv. malvacearum",
                "severity": "High",
                "description": "A bacterial cotton disease that creates angular leaf spots and can spread quickly in humid weather.",
                "symptoms": [
                    "Angular water-soaked spots on leaves",
                    "Dark lesions along veins",
                    "Leaf yellowing and premature drop",
                ],
                "treatment": [
                    "Remove and destroy infected plant debris",
                    "Use copper-based bactericides where locally recommended",
                    "Avoid working in fields when foliage is wet",
                ],
                "prevention": [
                    "Plant certified disease-free seed",
                    "Use resistant cotton varieties",
                    "Rotate away from cotton and manage crop residue",
                ],
            },
            "Curl Virus": {
                "scientific_name": "Cotton leaf curl virus complex",
                "severity": "Very High",
                "description": "A viral disease commonly spread by whiteflies, causing curling and stunting in cotton leaves.",
                "symptoms": [
                    "Upward or downward leaf curling",
                    "Thickened veins",
                    "Stunted plants and reduced boll formation",
                ],
                "treatment": [
                    "Remove severely infected plants early",
                    "Control whitefly populations",
                    "No direct chemical cure is available for infected plants",
                ],
                "prevention": [
                    "Use resistant or tolerant varieties",
                    "Monitor and control whiteflies",
                    "Remove weed hosts around fields",
                ],
            },
            "Healthy Leaf": {
                "scientific_name": "N/A",
                "severity": "None",
                "description": "The cotton leaf appears healthy with no clear disease symptoms.",
                "symptoms": [
                    "Even green leaf color",
                    "No visible lesions or curling",
                    "Normal leaf texture and shape",
                ],
                "treatment": [
                    "No treatment needed",
                ],
                "prevention": [
                    "Continue regular scouting",
                    "Maintain balanced irrigation and nutrition",
                    "Keep records of field conditions",
                ],
            },
            "Herbicide Growth Damage": {
                "scientific_name": "Abiotic herbicide injury",
                "severity": "Medium",
                "description": "Leaf distortion caused by herbicide drift, residue, or incorrect application rather than an infectious disease.",
                "symptoms": [
                    "Leaf cupping or twisting",
                    "Strapped or malformed new growth",
                    "Uneven damage pattern across the field",
                ],
                "treatment": [
                    "Stop suspected herbicide exposure",
                    "Irrigate and support plant recovery where appropriate",
                    "Consult a local agronomist before reapplying chemicals",
                ],
                "prevention": [
                    "Calibrate sprayers carefully",
                    "Avoid spraying during windy conditions",
                    "Follow label rates and plant-back intervals",
                ],
            },
            "Leaf Hopper Jassids": {
                "scientific_name": "Amrasca biguttula biguttula",
                "severity": "Medium to High",
                "description": "Damage caused by sap-sucking jassid insects feeding on cotton leaves.",
                "symptoms": [
                    "Yellowing at leaf edges",
                    "Downward curling",
                    "Bronzing or hopper burn under heavy infestation",
                ],
                "treatment": [
                    "Use locally recommended insecticides if thresholds are crossed",
                    "Encourage beneficial insects",
                    "Remove heavily infested plant material where practical",
                ],
                "prevention": [
                    "Scout the underside of leaves regularly",
                    "Avoid excessive nitrogen fertilizer",
                    "Use resistant or tolerant cotton varieties when available",
                ],
            },
            "Leaf Redding": {
                "scientific_name": "Physiological leaf reddening",
                "severity": "Medium",
                "description": "Reddish discoloration often associated with stress, nutrient imbalance, weather, or pest pressure.",
                "symptoms": [
                    "Red or purple leaf discoloration",
                    "Reduced vigor",
                    "Possible association with nutrient or moisture stress",
                ],
                "treatment": [
                    "Check soil moisture and nutrient status",
                    "Correct potassium or magnesium deficiency if confirmed",
                    "Inspect for sucking pests",
                ],
                "prevention": [
                    "Maintain balanced fertilization",
                    "Avoid drought stress",
                    "Monitor crop stress during rapid growth stages",
                ],
            },
            "Leaf Variegation": {
                "scientific_name": "Cotton leaf variegation symptom complex",
                "severity": "Medium",
                "description": "Patchy leaf color variation that can indicate stress, viral symptoms, or nutritional imbalance.",
                "symptoms": [
                    "Irregular pale and green patches",
                    "Mottled leaf appearance",
                    "Possible reduced plant vigor",
                ],
                "treatment": [
                    "Inspect for pest vectors and other field symptoms",
                    "Test soil and correct nutrition issues",
                    "Remove suspicious infected plants if viral spread is suspected",
                ],
                "prevention": [
                    "Use healthy seed and transplants",
                    "Control insect vectors",
                    "Keep field nutrition and irrigation consistent",
                ],
            },
        }

        return disease_db.get(disease_name, {
            "scientific_name": "Unknown",
            "severity": "Unknown",
            "description": "No information available",
            "symptoms": [],
            "treatment": [],
            "prevention": [],
        })


if __name__ == "__main__":
    print("Cotton disease predictor is ready. Use the FastAPI app for image uploads.")
