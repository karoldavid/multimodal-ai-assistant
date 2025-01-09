import logging
import os
import flask
import requests

logger = logging.getLogger(__name__)

bp = flask.Blueprint("speech", __name__, url_prefix="/api")


def create_speech_config():
    """
    Retrieves Azure Cognitive Services Speech configuration from environment variables.
    Logs any errors related to missing configuration.
    """
    speech_key = os.getenv("AZURE_SPEECH_KEY")
    speech_region = os.getenv("AZURE_SPEECH_REGION")

    if not speech_key or not speech_region:
        logger.error(
            "AZURE_SPEECH_KEY or AZURE_SPEECH_REGION is missing from environment variables."
        )
        raise ValueError("Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION environment variables.")

    logger.debug(f"Speech configuration retrieved: region={speech_region}")
    return speech_key, speech_region


@bp.route("/get-speech-token", methods=["GET"])
def get_speech_token():
    """
    Endpoint to retrieve a speech token from Azure Cognitive Services.
    """
    try:
        # Fetch the speech configuration
        speech_key, speech_region = create_speech_config()

        token_url = (
            f"https://{speech_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
        )
        headers = {
            "Ocp-Apim-Subscription-Key": speech_key,
            "Content-Type": "application/x-www-form-urlencoded",
        }

        logger.debug(f"Requesting token from URL: {token_url}")

        # Make the POST request to get the token
        response = requests.post(token_url, headers=headers)
        response.raise_for_status()  # Raise an HTTPError for bad responses

        logger.info("Successfully retrieved speech token.")
        logger.debug(f"Token response: {response.text}")

        return flask.jsonify({"token": response.text, "region": speech_region})

    except ValueError as ve:
        logger.error(f"Configuration error: {ve}")
        return flask.jsonify({"error": str(ve)}), 400

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching speech token: {e}")
        return flask.jsonify({"error": "Error authorizing speech key."}), 401
