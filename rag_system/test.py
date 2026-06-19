from dotenv import load_dotenv

import os
load_dotenv()

print("Testing environment variable loading:")
print("OPENAI_MODEL:", os.getenv("OPENAI_MODEL"))
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))
print("OPENAI_EMBEDDING_MODEL:", os.getenv("OPENAI_EMBEDDING_MODEL"))
