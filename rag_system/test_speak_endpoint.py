import requests
import json

# Test the /speak endpoint
url = "http://localhost:8001/speak"
payload = {
    "text": "Hello, this is a test of the speak feature",
    "language": "en"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type', 'N/A')}")
    print(f"Audio Size: {len(response.content)} bytes")
    
    if response.status_code == 200:
        print("✅ Success! Audio generated and ready to play")
        # Save the audio to a file
        with open("test_output.mp3", "wb") as f:
            f.write(response.content)
        print("Audio saved to test_output.mp3")
    else:
        print(f"❌ Error: {response.text}")
except Exception as e:
    print(f"❌ Request failed: {e}")
