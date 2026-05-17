from elevenlabs.client import ElevenLabs
import os
from dotenv import load_dotenv

load_dotenv()
client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))

# Test various common ElevenLabs voice IDs
voice_ids_to_test = {
    "Bella": "EXAVITQu4vr4xnSDxMaL",
    "Adam": "pNInz6obpgFNDAoai5b5",
    "Antoni": "EL1pMrFS51bs3PMDxsSL",
    "Asha": "CwhRBWXzGAHq8TQ4Xjr5",
    "Brian": "nPczCjzI2devNBz1zQrb",
    "Callista": "N2lVS1Beaj7aQEorapES",
    "Charlie": "IKne3meq5aSrNqXWdcjt",
    "Charlotte": "XB0fDUnXU5powFXDhCwa",
    "Cove": "2EiwWnXFnvU5JabPnv94",
    "Dorothy": "ThT5KcBeYPX3keUQqHPh",
    "Ember": "EsMnqrVVmJU5MqxISXsT",
    "Ethan": "g5CIjZEefAcw4BEsaKzw",
}

print("Testing available voice IDs...\n")
working_voices = {}

for name, voice_id in voice_ids_to_test.items():
    try:
        audio = client.text_to_speech.convert(
            voice_id=voice_id,
            text="Test",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128"
        )
        chunks = list(audio)
        working_voices[name] = voice_id
        print(f"✅ {name}: {voice_id}")
    except Exception as e:
        print(f"❌ {name}: {voice_id} - {str(e)[:50]}")

print(f"\n✅ Found {len(working_voices)} working voices:\n")
for name, voice_id in working_voices.items():
    print(f'    "{name}": "{voice_id}",')
