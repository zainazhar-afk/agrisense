"""
Simple smoke test script for the cotton disease FastAPI endpoint.
"""
import sys
from pathlib import Path

import requests


BASE_URL = "http://localhost:8000"


def test_health():
    """Test health endpoint."""
    print("\n1. Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health", timeout=10)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    return response.status_code == 200


def test_classes():
    """Test classes endpoint."""
    print("\n2. Testing classes endpoint...")
    response = requests.get(f"{BASE_URL}/classes", timeout=10)
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Classes: {data.get('num_classes')}")
    print(f"   Labels: {', '.join(data.get('classes', []))}")
    return response.status_code == 200


def test_predict(image_path):
    """Test prediction endpoint."""
    print("\n3. Testing prediction endpoint...")
    print(f"   Image: {image_path}")

    with open(image_path, "rb") as f:
        files = {"file": f}
        response = requests.post(f"{BASE_URL}/predict", files=files, timeout=60)

    print(f"   Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()["data"]
        print("\n   Prediction result:")
        print(f"      Disease: {data['top_prediction']['disease']}")
        print(f"      Confidence: {data['top_prediction']['confidence_percent']}")
        print(f"      Severity: {data['disease_info']['severity']}")
        return True

    print(f"   Error: {response.json()}")
    return False


def main():
    """Run all tests."""
    print("=" * 80)
    print("Testing AgriSense AI - Cotton Leaf Disease Detection API")
    print("=" * 80)

    health_ok = test_health()
    classes_ok = test_classes()

    predict_ok = False
    if len(sys.argv) > 1:
        sample_image = Path(sys.argv[1])
        predict_ok = sample_image.exists() and test_predict(sample_image)
    else:
        print("\n3. Prediction skipped. Pass an image path to test /predict.")

    print("\n" + "=" * 80)
    print("Test summary:")
    print(f"   Health Check: {'PASS' if health_ok else 'FAIL'}")
    print(f"   Get Classes: {'PASS' if classes_ok else 'FAIL'}")
    print(f"   Prediction: {'PASS' if predict_ok else 'SKIPPED/FAIL'}")
    print("=" * 80)


if __name__ == "__main__":
    main()
