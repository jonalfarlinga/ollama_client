# Ollama Chat Client

A lightweight web-based chat interface for Ollama models.

## Features

- Clean, modern web UI
- Real-time chat with Ollama models
- Model selection dropdown
- Chat history
- Code syntax highlighting
- Responsive design
- Error handling

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Make sure Ollama is running:**
   ```bash
   ollama serve
   ```

3. **Run the Flask app:**
   ```bash
   python main.py
   ```

4. **Open your browser and go to:**
   ```
   http://localhost:5000
   ```

## Usage

- Type your message in the text area
- Press Enter to send (Shift+Enter for new lines)
- Select different models from the dropdown
- Use "Clear Chat" to start fresh
- The app automatically detects available Ollama models

## Requirements

- Python 3.7+
- Ollama installed and running
- Flask
- A web browser

## Notes

- Chat history is stored in memory (resets when you restart the server)
- For production use, consider adding authentication and persistent storage
- The UI works on mobile devices
