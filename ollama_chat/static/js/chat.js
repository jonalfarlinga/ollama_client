// DOM elements
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const modelSelect = document.getElementById("modelSelect");
const sidebar = document.getElementById("sidebar");
const parametersInput = document.getElementById("parametersInput");

// Default parameters
let chatParameters = {
    options: {
        temperature: 0.7,
        num_predict: 1000,
        top_p: 0.9
    }
};

// Load available models
async function loadModels() {
  console.log("Loading models...");
  try {
    const response = await fetch("/api/models");
    const data = await response.json();
    console.log("Models response:", data);

    if (data.models && data.models.length > 0) {
      modelSelect.innerHTML = "";
      data.models.forEach((model, index) => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        // Set first model as default
        if (index === 0) {
          option.selected = true;
        }
        modelSelect.appendChild(option);
      });
      console.log("Models loaded successfully");
    } else {
      console.log("No models found");
      modelSelect.innerHTML = '<option value="">No models available</option>';
    }
  } catch (error) {
    console.error("Error loading models:", error);
    modelSelect.innerHTML = '<option value="">Error loading models</option>';
  }
}

// Send message function
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || sendBtn.disabled) return;

  const selectedModel = modelSelect.value;
  if (!selectedModel) {
    showError("Please select a model first");
    return;
  }

  // Add user message to chat
  addMessage(message, "user");
  messageInput.value = "";

  // Disable send button and show typing indicator
  sendBtn.disabled = true;
  const typingDiv = addTypingIndicator();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        model: selectedModel,
        parameters: chatParameters,
      }),
    });

    const data = await response.json();

    // Remove typing indicator
    typingDiv.remove();

    if (data.error) {
      showError(data.error);
    } else {
      addMessage(data.response, "assistant");
    }
  } catch (error) {
    typingDiv.remove();
    showError("Network error: " + error.message);
  } finally {
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Add message to chat
function addMessage(content, role) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${role}`;

  if (role === 'assistant') {
    // For assistant messages, render markdown
    try {
      // Configure marked options for better security and formatting
      marked.setOptions({
        breaks: true,        // Convert \n to <br>
        gfm: true,          // GitHub Flavored Markdown
        sanitize: false,    // We'll handle sanitization ourselves if needed
        smartypants: false  // Don't convert quotes/dashes
      });

      messageDiv.innerHTML = marked.parse(content);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      // Fallback to escaped text if markdown parsing fails
      messageDiv.textContent = content;
    }
  } else {
    // For user messages, just escape HTML but preserve formatting
    const escapedContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    messageDiv.innerHTML = escapedContent;
  }

  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing";
  typingDiv.textContent = "Assistant is typing...";
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;
  return typingDiv;
}

// Show error message
function showError(error) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error";
  errorDiv.textContent = error;
  messages.appendChild(errorDiv);
  messages.scrollTop = messages.scrollHeight;
}

// Clear chat
async function clearChat() {
  try {
    await fetch("/api/clear", { method: "POST" });
    messages.innerHTML =
      '<div class="message assistant">Hello! I\'m your Ollama chat assistant. How can I help you today?</div>';
  } catch (error) {
    showError("Error clearing chat: " + error.message);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, initializing chat...");

  // Verify DOM elements exist
  if (!messages || !messageInput || !sendBtn || !modelSelect) {
    console.error("Required DOM elements not found!");
    return;
  }

  // Handle Enter key in textarea
  messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  messageInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  });

  // Load models on page load
  loadModels();
  messageInput.focus();

  // Initialize parameters display
  updateParametersDisplay();
});

// Sidebar functions
function toggleSidebar() {
  sidebar.classList.toggle("open");
}

function applyParameters() {
  try {
    const paramText = parametersInput.value.trim();
    if (paramText) {
      const newParams = JSON.parse(paramText);
      chatParameters = { ...chatParameters, ...newParams };
      showMessage("Parameters applied successfully!", "success");
    }
  } catch (error) {
    showMessage("Invalid JSON format. Please check your syntax.", "error");
  }
}

function resetParameters() {
  chatParameters = {
    temperature: 0.7,
    max_tokens: 1000,
    top_p: 0.9
  };
  updateParametersDisplay();
  showMessage("Parameters reset to defaults.", "info");
}

function updateParametersDisplay() {
  parametersInput.value = JSON.stringify(chatParameters, null, 2);
}

function showMessage(text, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, 3000);
}
