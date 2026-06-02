# Plant Disease Detection Setup

## Prerequisites
- Python 3.10 or 3.11 recommended
- pip

## Install dependencies

```
cd plant_disease_detection
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Run the API

```
python api/app.py
```

The API runs on http://localhost:8000

## Test

```
python api/test_api.py path\to\cotton_leaf.jpg
```
