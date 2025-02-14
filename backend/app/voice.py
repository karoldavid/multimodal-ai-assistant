import os
import logging
import flask
from flask import request, jsonify
import speech_recognition as sr
from azure.cognitiveservices.speech import SpeechConfig, SpeechSynthesizer, AudioConfig

logger = logging.getLogger(__name__)

bp = flask.Blueprint("voice", __name__)

# Initialize Azure Speech Config for Text-to-Speech
speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")
if not speech_key or not speech_region:
    logger.error("Azure Speech key or region is not configured.")
    raise ValueError(
        "Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION environment variables."
    )
speech_config = SpeechConfig(subscription=speech_key, region=speech_region)


@bp.route("/api/voice", methods=["POST"])
def voice_input_route():
    try:
        # Extract the text from the request body
        data = request.json
        if not data or "text" not in data:
            logger.error("No text provided in the request.")
            return jsonify({"error": "No text provided"}), 400

        transcribed_text = data["text"]
        logger.info(f"Received transcribed text: {transcribed_text}")

        # Send transcribed text to the chat endpoint
        chat_response = flask.current_app.test_client().post(
            "/api/chat",
            json={"message": transcribed_text},
        )

        if chat_response.status_code != 200:
            logger.error(f"Error from chat API: {chat_response.json}")
            return jsonify({"error": "Chat API error"}), 500

        chat_reply = chat_response.json["reply"]
        logger.info(f"Chat response: {chat_reply}")

        # Convert AI response to speech
        audio_config = AudioConfig(use_default_speaker=True)
        synthesizer = SpeechSynthesizer(
            speech_config=speech_config, audio_config=audio_config
        )
        result = synthesizer.speak_text_async(chat_reply).get()

        if result.reason != result.Reason.SynthesizingAudioCompleted:
            logger.error(f"Error during speech synthesis: {result.reason}")
            return jsonify({"error": "Speech synthesis error"}), 500

        logger.info("Voice response synthesized successfully.")
        return jsonify({"reply": chat_reply})

    except Exception as e:
        logger.error(f"Error processing voice input: {str(e)}")
        return jsonify({"error": str(e)}), 500
