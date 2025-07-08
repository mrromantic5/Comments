from flask import Flask, request, jsonify, send_from_directory
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='../frontend', static_url_path='')
COMMENTS_FILE = 'comments.json'

# Ensure comments file exists
if not os.path.exists(COMMENTS_FILE):
    with open(COMMENTS_FILE, 'w') as f:
        json.dump([], f)

def load_comments():
    """Loads comments from the JSON file."""
    try:
        with open(COMMENTS_FILE, 'r') as f:
            return json.load(f)
    except (IOError, json.JSONDecodeError):
        return []

def save_comments(comments):
    """Saves comments to the JSON file."""
    with open(COMMENTS_FILE, 'w') as f:
        json.dump(comments, f, indent=4)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/comments', methods=['GET', 'POST'])
def handle_comments():
    if request.method == 'POST':
        data = request.json
        if not data or 'name' not in data or 'message' not in data:
            return jsonify({"error": "Name and message are required"}), 400

        comments = load_comments()
        
        new_comment = {
            "id": len(comments) + 1, # Simple ID generation
            "name": data['name'],
            "message": data['message'],
            "profile": data.get('profile'), # Optional profile pic URL
            "timestamp": datetime.utcnow().isoformat() + "Z" # ISO 8601 format
        }
        comments.append(new_comment)
        save_comments(comments)
        return jsonify(new_comment), 201

    elif request.method == 'GET':
        comments = load_comments()
        # Sort comments by timestamp, newest first, before sending
        # comments.sort(key=lambda c: c['timestamp'], reverse=True) # Already handled by frontend, but good practice
        return jsonify(comments)

if __name__ == '__main__':
    # For development, it's common to run on port 5000 or similar.
    # For production, a proper WSGI server like Gunicorn would be used.
    app.run(debug=True, port=5001)
