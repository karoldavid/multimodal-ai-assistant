import os
import logging
import flask
from flask import session
from openai import AzureOpenAI

logger = logging.getLogger(__name__)

bp = flask.Blueprint("chat", __name__)


def create_chat_client():
    """
    API key is read from the environment variable AZURE_OPENAI_API_KEY.
    Logs any errors related to missing configuration.
    """
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_key = os.getenv("AZURE_OPENAI_API_KEY")

    if not azure_endpoint or not api_key:
        logger.error(
            "AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY is missing from environment variables."
        )
        raise ValueError(
            "Missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY environment variables."
        )

    logger.debug("Azure OpenAI configuration retrieved.")
    client = AzureOpenAI(
        azure_endpoint=azure_endpoint,
        api_key=api_key,
        api_version="2024-02-01",
    )
    return client


def chat(client, messages):
    logger.debug(f"Sending chat request with messages: {messages}")
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_MODEL", "gpt-4o"),
        messages=messages,
    )
    logger.debug(f"Received chat response: {response}")
    return response


def extract_message(chat_result):
    message = chat_result.choices[0].message.content
    logger.debug(f"Extracted message: {message}")
    return message


@bp.route("/api/chat", methods=["POST"])
def chat_route():
    user_input = flask.request.json.get("message")
    if not user_input:
        logger.error("No message provided in the request.")
        return flask.jsonify({"error": "No message provided"}), 400
    try:
        # Retrieve or initialize the conversation history
        if "conversation_history" not in session:
            session["conversation_history"] = [
                {
                    "role": "system",
                    "content": "You are 'Biz Talk', an AI business meeting analyzer focused on quick, actionable insights. Your responses should be brief and spoken naturally (1-3 sentences max).\n\nFor any response longer than 3 sentences, label it as [DISPLAY ONLY - DO NOT SPEAK].\n\nWhen analyzing meetings:\n1. Focus on communication patterns, cultural dynamics, and business efficiency\n2. Ask simple yes/no questions or provide two clear options\n3. Suggest concrete actions for improvement\n4. Keep verbal responses conversational and concise\n5. Use voice for key insights, display for detailed analysis\n\n[DISPLAY ONLY - DO NOT SPEAK]\nAnalysis categories to track:\n- Meeting efficiency metrics\n- Cultural communication patterns\n- Power dynamics and hierarchies\n- Decision-making clarity\n- Action item follow-through\n- Communication barriers\n- Suggested improvements\n\nFor uploaded meeting transcripts:\n1. Offer quick verbal summary\n2. Suggest 2-3 immediate actions\n3. Ask if user wants to:\n   a) Focus on cultural dynamics\n   b) Focus on meeting efficiency",
                }
            ]
        logger.debug(f"Current conversation history: {session['conversation_history']}")
        # Append the new user input to the history
        session["conversation_history"].append({"role": "user", "content": user_input})
        # Send the conversation history to the API
        chat_client = create_chat_client()
        chat_result = chat(chat_client, session["conversation_history"])
        # Get the assistant's reply
        assistant_message = extract_message(chat_result)
        # Append the assistant's reply to the history
        session["conversation_history"].append(
            {"role": "assistant", "content": assistant_message}
        )
        logger.debug(f"Updated conversation history: {session['conversation_history']}")
        logger.info("Successfully processed chat request.")
        return flask.jsonify({"reply": assistant_message})
    except ValueError as ve:
        logger.error(f"Configuration error: {ve}")
        return flask.jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return flask.jsonify({"error": str(e)}), 500
