from elevenlabs.client import ElevenLabs
import os
from dotenv import load_dotenv

load_dotenv()
client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))

# Try to use a known default voice ID
# Bella's voice ID (commonly available)
bella_voice_id = "EXAVITQu4vr4xnSDxMaL"

try:
    audio = client.text_to_speech.convert(
        voice_id=bella_voice_id,
        text="Hello world, this is a test",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128"
    )
    # Consume the iterator to verify it works
    chunks = list(audio)
    print(f"✅ Audio generation successful with {len(chunks)} chunks")
except Exception as e:
    print(f"❌ Error: {e}")
