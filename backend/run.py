import logging
import os
from app import create_app

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = create_app()

# Read environment variables
azure_openai_api_key = os.getenv("AZURE_OPENAI_API_KEY")
azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")

@app.route("/")
def index():
    return f"Flask server is running on localhost:5000. API Key: {azure_openai_api_key}, Endpoint: {azure_openai_endpoint}"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
