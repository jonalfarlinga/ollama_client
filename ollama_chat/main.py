from flask import Flask, render_template, request, jsonify
from ollama import Client

app = Flask(__name__)
client = Client()

chat_history = []


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    model = data.get('model', 'mistral')
    parameters = data.get('parameters', {})
    print(f"Model: {model}, Parameters: {parameters}")

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    # Add user message to history
    chat_history.append({'role': 'user', 'content': user_message})

    try:
        # Get response from Ollama
        response = client.chat(model=model,
                               messages=chat_history,
                               stream=False,
                               options=parameters.get('options', {}))

        assistant_message = response['message']['content']
        print(f"Assistant: {assistant_message}")
        # Add assistant response to history
        chat_history.append({
            'role': 'assistant',
            'content': assistant_message
        })

        return jsonify({
            'response': assistant_message,
            'model': model,
            'parameters_used': parameters
        })

    except Exception as e:
        return jsonify({'error':
                        f'Error communicating with Ollama: {str(e)}'}), 500


@app.route('/api/clear', methods=['POST'])
def clear_history():
    global chat_history
    chat_history = []
    return jsonify({'status': 'success'})


@app.route('/api/models')
def get_models():
    try:
        models = client.list()
        # Extract model names from the models list
        model_names = [model.model for model in models.models]
        return jsonify({'models': model_names})
    except Exception as e:
        return jsonify({'error': f'Error fetching models: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
