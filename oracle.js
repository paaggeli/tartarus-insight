document.addEventListener('DOMContentLoaded', () => {
  const messageContainer = document.getElementById('message-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const connectButton = document.getElementById('connect-api-button');
  const modelSelect = document.getElementById('model-select');
  const settingsMessage = document.getElementById('settings-message');
  // Modal
  const settingsButton = document.getElementById('settings-button');
  const closeModalButton = document.getElementById('close-modal-button');
  const modal = document.getElementById('settings-modal');
  const apiSelect = document.getElementById('api-select');
  const ollamaSettings = document.getElementById('ollama-settings');
  const ollamaUrlInput = document.getElementById('ollama-url');
  const cancelButton = document.getElementById('cancel-button');
  const okButton = document.getElementById('ok-button');

  const getOllamaUrl = () => ollamaUrlInput.value.trim();
  let tempUrl = ollamaUrlInput.value; // Store the original value: http://localhost:11434

  // Initialize conversation history
  let conversationHistory = [
    {
      "role": "system",
      "content": "Your name is Oracle, you live in Tartarus and you help entrepreneurs to escape from Tartarus."
    }
  ];

  // Function to add a new message to the chat
  const addMessage = (message) => {
    const messageDiv = document.createElement('div');
    // Add classes for styling
    messageDiv.className = 'message user';

    // Set the inner HTML of the message
    const md = window.markdownit();
    messageDiv.innerHTML = md.render(message);
    messageContainer.appendChild(messageDiv);

    // Scroll to the bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Clear the input field
    messageInput.value = '';
    messageInput.style.height = 'auto';
  };

  const askOracle = (prompt, model) => {
    // Add the user's message to the conversation history
    conversationHistory.push({ role: "user", content: prompt });

    // Create a new message div for streaming response
    const responseDiv = document.createElement('div');
    responseDiv.className = 'message response';
    messageContainer.appendChild(responseDiv);

    // Initialize the markdown-it library
    const md = window.markdownit();

    // Initialize a buffer for accumulating the full response
    let responseBuffer = '';
    const apiUrl = getOllamaUrl();
    fetch(`${apiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: conversationHistory,
        stream: true
      })
    })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          // Decode the current chunk and add it to the buffer
          buffer += decoder.decode(value, { stream: true });
          let boundary = buffer.indexOf('\n');
          while (boundary !== -1) {
            const jsonString = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 1);

            try {
              // Parse the JSON and extract message.content
              const jsonObject = JSON.parse(jsonString);
              if (jsonObject.message && jsonObject.message.content) {
                responseBuffer += jsonObject.message.content; // Append the content
                // Re-render the Markdown with the updated buffer
                responseDiv.innerHTML = md.render(responseBuffer);
                // Ensure the message container stays scrolled to the bottom
                messageContainer.scrollTop = messageContainer.scrollHeight;
              }
              // If the response is complete, update conversation history
              if (jsonObject.done) {
                conversationHistory.push({
                  role: "assistant",
                  content: responseBuffer
                });
                console.log('Stream finished.');
                return;
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }

            boundary = buffer.indexOf('\n');
          }
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      responseDiv.innerHTML = '<p style="color: red;">Error: Unable to fetch a response from the Oracle.</p>';
    });
  };

  // Event listener for the send button
  sendButton.addEventListener('click', () => {
    if (messageInput.value.trim() === '') return;
    const userPrompt = messageInput.value;
    addMessage(userPrompt);
    askOracle(userPrompt, modelSelect.value);
    console.log(userPrompt);
  });

  // Allow sending messages with Enter key
  messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent a new line
      if (messageInput.value.trim() === '') return;
      const userPrompt = messageInput.value;
      addMessage(userPrompt);
      askOracle(userPrompt, modelSelect.value);
      console.log(userPrompt);
    }
  });

  // Automatically resize the textarea as the user types
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto'; // Reset height to calculate new height
    // Calculate new height but cap it at 10 lines
    const maxHeight = parseInt(getComputedStyle(messageInput).lineHeight, 10) * 10; // Height for 10 lines
    const newHeight = Math.min(messageInput.scrollHeight, maxHeight);

    messageInput.style.height = `${newHeight}px`; // Set to the new height or max height
  });

  // Connect to API
  connectButton.addEventListener('click', () => {
    // Clear previous messages
    settingsMessage.textContent = '';
    // Fetch models from the API
    const apiUrl = getOllamaUrl();
    fetch(`${apiUrl}/api/tags`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          // Clear previous options
          modelSelect.innerHTML = '';

          // Populate the select element with model names
          data.models.forEach((model) => {
            if (model.name) {
              const option = document.createElement('option');
              option.value = model.name;
              option.textContent = model.name;
              modelSelect.appendChild(option);
            }
          });

          // Automatically select the first model
          modelSelect.value = data.models[0].name;

          // Show the select element and hide the connect button
          modelSelect.classList.remove('hidden');
          connectButton.classList.add('hidden');

          // Enable the textarea and send button
          messageInput.disabled = false;
          sendButton.disabled = false;
        } else {
          throw new Error('No models available on your system. Please download one https://ollama.com/search?q=llama');
        }
      })
      .catch((error) => {
        // Display error message
        settingsMessage.textContent = `Error: ${error.message}. Make sure that the Ollama app is currently running. If it is running, ensure it is accessible on 'localhost:11434'.`;
      });
  });

  //* Modal
  // Show the modal
  settingsButton.addEventListener('click', () => {
    tempUrl = ollamaUrlInput.value;
    modal.style.display = 'flex';
  });

  // Close the modal
  closeModalButton.addEventListener('click', () => {
    ollamaUrlInput.value = tempUrl; // Revert to the original value
    modal.style.display = 'none';
  });

  // Cancel Button: Discard Changes
  cancelButton.addEventListener('click', () => {
    ollamaUrlInput.value = tempUrl; // Revert to the original value
    modal.style.display = 'none'; // Close the modal
  });

  // OK Button: Apply Changes
  okButton.addEventListener('click', () => {
    baseApiUrl = ollamaUrlInput.value; // Update global base API URL
    modal.style.display = 'none'; // Close the modal
    console.log('New Ollama URL:', baseApiUrl);
  });

  // Update settings visibility based on selection
  apiSelect.addEventListener('change', () => {
    if (apiSelect.value === 'ollama') {
      ollamaSettings.style.display = 'block';
    } else {
      ollamaSettings.style.display = 'none';
    }
  });

  // Set initial visibility
  if (apiSelect.value === 'ollama') {
    ollamaSettings.style.display = 'block';
  } else {
    ollamaSettings.style.display = 'none';
  }

});