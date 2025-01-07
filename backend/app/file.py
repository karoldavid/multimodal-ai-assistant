import os
import logging
import flask
import fitz  # PyMuPDF
from werkzeug.utils import secure_filename
from .chat import create_chat_client, chat, extract_message

logger = logging.getLogger(__name__)

UPLOAD_FOLDER = "/tmp"
ALLOWED_EXTENSIONS = {'pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

bp = flask.Blueprint("file_upload", __name__)

@bp.before_request
def limit_file_size():
    if flask.request.content_length > MAX_FILE_SIZE:
        logger.error("File size exceeds the limit.")
        return flask.jsonify({"error": "File size exceeds 10 MB limit"}), 413

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route("/api/file", methods=["POST"])
def upload_file(chat_client_creator=create_chat_client):
    if "file" not in flask.request.files:
        logger.error("No file provided in the request.")
        return flask.jsonify({"error": "No file provided"}), 400

    file = flask.request.files["file"]
    if file.filename == "":
        logger.error("No file selected for upload.")
        return flask.jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        logger.error("Invalid file type.")
        return flask.jsonify({"error": "Invalid file type. Only PDF files are allowed."}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        file.save(file_path)
        logger.info(f"File saved to {file_path}")
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        return flask.jsonify({"error": "Error saving file."}), 500

    # Extract text from the PDF
    try:
        pdf_document = fitz.open(file_path)
        pdf_text = ""
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            pdf_text += page.get_text()

        logger.info("PDF text extracted successfully.")

        # Retrieve or initialize the conversation history
        if "conversation_history" not in flask.session:
            flask.session["conversation_history"] = [
                {
                    "role": "system",
                    "content": "You are 'Biz Talk', an AI business meeting analyzer focused on quick, actionable insights. Your responses should be brief and spoken naturally (1-3 sentences max).\n\nFor any response longer than 3 sentences, label it as [DISPLAY ONLY - DO NOT SPEAK].\n\nWhen analyzing meetings:\n1. Focus on communication patterns, cultural dynamics, and business efficiency\n2. Ask simple yes/no questions or provide two clear options\n3. Suggest concrete actions for improvement\n4. Keep verbal responses conversational and concise\n5. Use voice for key insights, display for detailed analysis\n\n[DISPLAY ONLY - DO NOT SPEAK]\nAnalysis categories to track:\n- Meeting efficiency metrics\n- Cultural communication patterns\n- Power dynamics and hierarchies\n- Decision-making clarity\n- Action item follow-through\n- Communication barriers\n- Suggested improvements\n\nFor uploaded meeting transcripts:\n1. Offer quick verbal summary\n2. Suggest 2-3 immediate actions\n3. Ask if user wants to:\n   a) Focus on cultural dynamics\n   b) Focus on meeting efficiency",
                }
            ]
        logger.debug(f"Current conversation history: {flask.session['conversation_history']}")

        # Append the extracted PDF text to the conversation history
        flask.session["conversation_history"].append(
            {"role": "user", "content": pdf_text}
        )

        # Send the conversation history to the API
        chat_client = create_chat_client()
        chat_result = chat(chat_client, flask.session["conversation_history"])

        # Get the assistant's reply
        assistant_message = extract_message(chat_result)

        # Append the assistant's reply to the conversation history
        flask.session["conversation_history"].append(
            {"role": "assistant", "content": assistant_message}
        )
        logger.debug(f"Updated conversation history: {flask.session['conversation_history']}")

        logger.info("Successfully processed PDF text with OpenAI.")
        return flask.jsonify({"reply": assistant_message, "file_path": file_path}), 200

    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}")
        return flask.jsonify({"error": "Failed to process the file."}), 500
