document.addEventListener('DOMContentLoaded', () => {
  const messageContainer = document.getElementById('message-container');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const apiDropdown = document.getElementById('api-dropdown');
  const modelSelect = document.getElementById('model-select');
  const modelsWrapper = document.querySelector('.models-wrapper');
  const backToApiButton = document.getElementById('back-arrow');
  const settingsMessage = document.getElementById('settings-message');
  // Modal
  const settingsButton = document.getElementById('settings-button');
  const closeModalButton = document.getElementById('close-modal-button');
  const modal = document.getElementById('settings-modal');
  const apiSelect = document.getElementById('api-select');
  const ollamaSettings = document.getElementById('ollama-settings');
  const ollamaUrlInput = document.getElementById('ollama-url');
  const openaiSettings = document.getElementById('openai-settings');
  const openaiApiKeyInput = document.getElementById('openai-api-key');
  const claudeSettings = document.getElementById('claude-settings');
  const claudeApiKeyInput = document.getElementById('claude-api-key');
  const cancelButton = document.getElementById('cancel-button');
  const okButton = document.getElementById('ok-button');

  //* Modal
  const getOllamaUrl = () => ollamaUrlInput.value.trim();
  let tempUrl = ollamaUrlInput.value; // Store the original value: http://localhost:11434
  const getOpenAIApiKey = () => openaiApiKeyInput.value.trim();
  let tempOpenAIApiKey = openaiApiKeyInput.value;
  const getClaudeApiKey = () => claudeApiKeyInput.value.trim();
  let tempClaudeApiKey = claudeApiKeyInput.value;
  
  // Show the modal
  settingsButton.addEventListener('click', () => {
    tempUrl = ollamaUrlInput.value;
    tempOpenAIApiKey = openaiApiKeyInput.value;
    tempClaudeApiKey = claudeApiKeyInput.value;
    modal.style.display = 'flex';
  });

  // X Button: Close the modal - Discard Changes
  closeModalButton.addEventListener('click', () => {
    closeModal();
  });

  // Cancel Button: Close the modal - Discard Changes
  cancelButton.addEventListener('click', () => {
    closeModal();
  });

  const closeModal = () => {
    ollamaUrlInput.value = tempUrl; // Revert to the original value
    openaiApiKeyInput.value = tempOpenAIApiKey; // Revert to original API key
    claudeApiKeyInput.value = tempClaudeApiKey; // Revert to original API key
    modal.style.display = 'none'; // Close the modal
  }

  // OK Button: Apply Changes
  okButton.addEventListener('click', () => {
    modal.style.display = 'none'; // Close modal
    console.log('New settings applied:');
    console.log('Ollama URL:', ollamaUrlInput.value);
    console.log('OpenAI API Key:', openaiApiKeyInput.value);
    console.log('Claude API Key:', claudeApiKeyInput.value);
  });

  
  const apiSelection = (option) => {
    if (option === 'ollama') {
      ollamaSettings.style.display = 'block';
      openaiSettings.style.display = 'none';
      claudeSettings.style.display = 'none';
    } else if (option === 'openai') {
      ollamaSettings.style.display = 'none';
      openaiSettings.style.display = 'block';
      claudeSettings.style.display = 'none';
    } else {
      ollamaSettings.style.display = 'none';
      openaiSettings.style.display = 'none';
      claudeSettings.style.display = 'block';
    }
  }

  // Set initial visibility
  apiSelection(apiSelect.value);

  // Update settings visibility based on selection
  apiSelect.addEventListener('change', () => {
    apiSelection(apiSelect.value);
  });

  //* Selecting API
  // Event listener for API dropdown change
  apiDropdown.addEventListener('change', () => {
    const selectedApi = apiDropdown.value;

    if (selectedApi === 'ollama') {
        fetchModelsFromOllama();
    } else if (selectedApi === 'openai') {
      // OpenAI's available models
      const openAiModels = ['gpt-4o-mini','gpt-4o'];
      populateModelSelect(openAiModels);
      // Show the model select dropdown and hide the API dropdown
      showModelSelect();
    } else if (selectedApi === 'claude') {
      // Anthropic's available models
      const claudeModels = ['claude-3-5-haiku-20241022','claude-3-5-sonnet-20241022'];
      populateModelSelect(claudeModels);
      // Show the model select dropdown and hide the API dropdown
      showModelSelect();
    } else {
      // Enable the textarea and send button
      messageInput.disabled = true;
      sendButton.disabled = true;
    }
  });

  // Back arrow to return to API selection
  backToApiButton.addEventListener('click', () => {
    modelsWrapper.classList.add('hidden');
    apiDropdown.classList.remove('hidden');
    apiDropdown.value = "";
    messageInput.disabled = true;
    sendButton.disabled = true;
  });

  // Fetch models from Ollama API
  function fetchModelsFromOllama() {
    // Clear previous messages
    settingsMessage.textContent = '';
    const apiUrl = getOllamaUrl();
    // Fetch models from the API
    fetch(`${apiUrl}/api/tags`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          populateModelSelect(data.models.map((model) => model.name));
          // Show the model select dropdown and hide the API dropdown
          showModelSelect();
        } else {
          throw new Error('No models available on your system. Please download one https://ollama.com/search?q=llama');
        }
      })
      .catch((error) => {
        // Display error message
        settingsMessage.textContent = `Error: ${error.message}. Make sure that the Ollama app is currently running. If it is running, ensure it is accessible on 'localhost:11434'.`;
      });
  };

  function populateModelSelect(models) {
    modelSelect.innerHTML = ''; // Clear previous options
    models.forEach((model) => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });

    // Automatically select the first model
    modelSelect.value = models[0];
  }

  function showModelSelect() {
    modelsWrapper.classList.remove('hidden');
    apiDropdown.classList.add('hidden');

    // Enable the textarea and send button
    messageInput.disabled = false;
    sendButton.disabled = false;
  }
  
  //* User's input
  // Event listener for the send button
  sendButton.addEventListener('click', () => {
    if (messageInput.value.trim() === '') return;
    const userPrompt = messageInput.value;
    addMessage(userPrompt);
    askOracle(userPrompt, modelSelect.value, apiDropdown.value);
    console.log(userPrompt);
  });

  // Allow sending messages with Enter key
  messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent a new line
      if (messageInput.value.trim() === '') return;
      const userPrompt = messageInput.value;
      addMessage(userPrompt);
      askOracle(userPrompt, modelSelect.value, apiDropdown.value);
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

  

  //* Call API
  // Base system prompts for each API
  const systemPrompts = {
    ollama: {
      role: "system",
      content: "You are the Oracle of Tartarus Insight, a mystical and all-knowing guide for entrepreneurs lost in the abyss of business struggles. Your mission is to provide practical, actionable advice to help them escape their challenges, but you must do so in a playful, lighthearted, and mystical tone that aligns with your enigmatic persona.\n\nSpeak as if you are a wise, ancient Oracle. Use playful, mystical language, but ensure your responses are approachable and clear to everyone. Gently tease the user about their predicament, but always remain encouraging and respectful. Your advice must be grounded and useful, covering topics like strategy, growth, marketing, and other entrepreneurial challenges. Help the user see a clear path forward.\n\nUse humor that is lighthearted and self-aware. Feel free to poke fun at the user’s situation, but always ensure it feels supportive rather than dismissive. Despite your mystical tone, ensure your answers are straightforward and actionable. Avoid being vague or overly abstract.\n\nFor example:\nUser: \"How do I get more customers for my online store?\"\nOracle: \"Ah, a common plight for a merchant stranded in the abyss of obscurity. Fear not! The Oracle sees all. Begin by summoning the power of social media ads—Facebook and Instagram shall be your allies. Offer discounts to entice the wary. And remember: clear, compelling product photos are worth their weight in gold. Go now, and may your customer count multiply like stars in the night sky!\""
    },
    openai: {
      role: "system",
      content: [
        {
          type: "text",
          text: "You are the Oracle of Tartarus Insight, a mystical and all-knowing guide for entrepreneurs lost in the abyss of business struggles. Your mission is to provide practical, actionable advice to help them escape their challenges, but you must do so in a playful, lighthearted, and mystical tone that aligns with your enigmatic persona.\n\nSpeak as if you are a wise, ancient Oracle. Use playful, mystical language, but ensure your responses are approachable and clear to everyone. Gently tease the user about their predicament, but always remain encouraging and respectful. Your advice must be grounded and useful, covering topics like strategy, growth, marketing, and other entrepreneurial challenges. Help the user see a clear path forward.\n\nUse humor that is lighthearted and self-aware. Feel free to poke fun at the user’s situation, but always ensure it feels supportive rather than dismissive. Despite your mystical tone, ensure your answers are straightforward and actionable. Avoid being vague or overly abstract.\n\nFor example:\nUser: \"How do I get more customers for my online store?\"\nOracle: \"Ah, a common plight for a merchant stranded in the abyss of obscurity. Fear not! The Oracle sees all. Begin by summoning the power of social media ads—Facebook and Instagram shall be your allies. Offer discounts to entice the wary. And remember: clear, compelling product photos are worth their weight in gold. Go now, and may your customer count multiply like stars in the night sky!\""
        }
      ]
    },
    claude: "You are the Oracle of Tartarus Insight, a mystical and all-knowing guide for entrepreneurs lost in the abyss of business struggles. Your mission is to provide practical, actionable advice to help them escape their challenges, but you must do so in a playful, lighthearted, and mystical tone that aligns with your enigmatic persona.\n\nSpeak as if you are a wise, ancient Oracle. Use playful, mystical language, but ensure your responses are approachable and clear to everyone. Gently tease the user about their predicament, but always remain encouraging and respectful. Your advice must be grounded and useful, covering topics like strategy, growth, marketing, and other entrepreneurial challenges. Help the user see a clear path forward.\n\nUse humor that is lighthearted and self-aware. Feel free to poke fun at the user’s situation, but always ensure it feels supportive rather than dismissive. Despite your mystical tone, ensure your answers are straightforward and actionable. Avoid being vague or overly abstract.\n\nFor example:\nUser: \"How do I get more customers for my online store?\"\nOracle: \"Ah, a common plight for a merchant stranded in the abyss of obscurity. Fear not! The Oracle sees all. Begin by summoning the power of social media ads—Facebook and Instagram shall be your allies. Offer discounts to entice the wary. And remember: clear, compelling product photos are worth their weight in gold. Go now, and may your customer count multiply like stars in the night sky!\"",
  };

  // Initialize conversation history dynamically
  const initializeConversationHistory = (apiType) => {
    if (apiType === 'claude') return [];
    return [systemPrompts[apiType]];
  };

  // Format user message based on API type
  const formatUserMessage = (prompt, apiType) => {
    if (apiType === 'ollama') {
      return { role: "user", content: prompt };
    } else if (apiType === 'openai' || apiType === 'claude') {
      return {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          }
        ]
      };
    }
    throw new Error(`Unsupported API type: ${apiType}`);
  };

  let conversationHistory;

  // Ask Oracle function
  const askOracle = (prompt, model, apiType) => {
    // Initialize conversation history based on the API type
    if (!conversationHistory) {
      conversationHistory = initializeConversationHistory(apiType);
    }
    // Add the user's message to the conversation history
    conversationHistory.push(formatUserMessage(prompt, apiType));

    // Create a new message div for streaming response
    const responseDiv = document.createElement('div');
    responseDiv.className = 'message response';
    messageContainer.appendChild(responseDiv);

    // Initialize the markdown-it library
    const md = window.markdownit();

    // Choose the appropriate API handler
    if (apiType === 'ollama') {
      handleOllamaRequest(conversationHistory, model, responseDiv, md);
    } else if (apiType === 'openai') {
      handleOpenAIRequest(conversationHistory, model, responseDiv, md);
    } else if (apiType == 'claude') {
      handleClaudeRequest(conversationHistory, model, responseDiv, md);
    } else {
      responseDiv.innerHTML = '<p style="color: red;">Error: Unsupported API type.</p>';
    }
  };

  // Handle Ollama API requests
  const handleOllamaRequest = (conversationHistory, model, responseDiv, md) => {
    const apiUrl = getOllamaUrl();
    let responseBuffer = '';

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

  // Handle OpenAI API requests
  const handleOpenAIRequest = (conversationHistory, model, responseDiv, md) => {
    const apiKey = getOpenAIApiKey(); // Fetch the API key from the modal or settings
    let responseBuffer = '';

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: conversationHistory,
        stream: true,
      })
    })
    .then(async response => {
      // console.log('response from OpenAI');
      // console.log(response);
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
        // console.log('OpenAI the value returned');
        // console.log(value);
        if (value) {
          // Decode the current chunk and add it to the buffer
          buffer += decoder.decode(value, { stream: true });
          // console.log('OpenAI the buffer, decoder.decode, returned');
          // console.log(buffer);
          let boundary = buffer.indexOf('\n');
          while (boundary !== -1) {
            const line = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 1);
            try {
              if ( line.startsWith('data: ') && !line.startsWith('data: [DONE]')) {
                // Parse the JSON and extract message.content
                const jsonObject = JSON.parse(line.slice(6));
                
                const deltaText = jsonObject.choices[0].delta.content || '';
                responseBuffer += deltaText; // Append the content
                // Re-render the Markdown with the updated buffer
                responseDiv.innerHTML = md.render(responseBuffer);
                //console.log('It should display the response');
                // Ensure the message container stays scrolled to the bottom
                messageContainer.scrollTop = messageContainer.scrollHeight;
                if (jsonObject.choices[0].finish_reason === 'stop') {
                  conversationHistory.push({
                    role: "assistant",
                    content: [
                      {
                        type: "text",
                        text: responseBuffer
                      }
                    ]
                  });
                  console.log('Stream finished.');
                  //console.log('The response is:');
                  //console.log(responseBuffer);
                  return;
                }
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

  // Handle Claude API requests
  const handleClaudeRequest = (conversationHistory, model, responseDiv, md) => {
    const apiKey = getClaudeApiKey(); // Fetch the API key from the modal or settings
    let responseBuffer = '';
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        system: systemPrompts['claude'],
        messages: conversationHistory,
        stream: true,
      }),
    })
    .then(async response => {
      console.log('response from claude');
      //console.log(response);
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
        //console.log('claude the value returned');
        //console.log(value);
        if (value) {
          // Decode the current chunk and add it to the buffer
          buffer += decoder.decode(value, { stream: true });
          //console.log('claude the buffer, decoder.decode, returned');
          //console.log(buffer);
          let boundary = buffer.indexOf('\n');
          while (boundary !== -1) {
            const line = buffer.slice(0, boundary).trim();
            buffer = buffer.slice(boundary + 1);
            try {
              if ( line.startsWith('data: ')) {
                // Parse the JSON and extract message.content
                const jsonObject = JSON.parse(line.slice(6));
                if (jsonObject.type === 'content_block_delta') {
                  const deltaText = jsonObject.delta.text || '';
                  responseBuffer += deltaText; // Append the content
                  // Re-render the Markdown with the updated buffer
                  responseDiv.innerHTML = md.render(responseBuffer);
                  //console.log('It should display the response');
                  // Ensure the message container stays scrolled to the bottom
                  messageContainer.scrollTop = messageContainer.scrollHeight;
                } else if (jsonObject.type === 'content_block_stop') {
                  conversationHistory.push({
                    role: "assistant",
                    content: [
                      {
                        type: "text",
                        text: responseBuffer
                      }
                    ]
                    // role: "assistant",
                    // content: responseBuffer
                  });
                  console.log('Stream finished.');
                  //console.log('The response is:');
                  //console.log(responseBuffer);
                  return;
                }
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

});