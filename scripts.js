// Responsive menu
const hamburger = document.querySelector('.hamburger');
const closeMenu = document.querySelector('.close-mobile-menu');
const navMenu = document.querySelector('#navMenu');
const navLinks = document.querySelectorAll('#navMenu ul li a');

hamburger.addEventListener('click', () => {
    navMenu.classList.add('active');
    hamburger.style.display = 'none';
    closeMenu.style.display = 'block';
});

closeMenu.addEventListener('click', () => {
    closeNavMenu();
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeNavMenu();
    });
});

function closeNavMenu() {
    navMenu.classList.remove('active');
    hamburger.style.display = 'block';
    closeMenu.style.display = 'none';
}

// Using Fetch API
// fetch('http://localhost:11434/api/generate', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//         model: "llama3.2:1b",
//         prompt: "Why is the sky blue?",
//         format: "json",
//         stream: false
//     })
//   })
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error('Error:', error));

// fetch('http://localhost:11434/api/generate', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       model: "llama3.2:1b",
//       prompt: "Why is the sky blue?"
//     })
// })
// .then(response => response.text()) // Get the response as plain text
// .then(text => {
//     console.log("Raw Response:", text);

//     // Split the text into separate JSON objects (assuming newline-delimited JSON)
//     const jsonObjects = text.trim().split('\n').map(line => {
//         try {
//             return JSON.parse(line);
//         } catch (error) {
//             console.error("Failed to parse JSON line:", line, error);
//             return null; // Handle invalid JSON gracefully
//         }
//     }).filter(obj => obj !== null); // Remove any null entries due to parsing errors

//     console.log("Parsed JSON Objects:", jsonObjects);

//     // Process the parsed JSON objects as needed
//     jsonObjects.forEach(obj => console.log("Processed Object:", obj));
// })
// .catch(error => console.error('Error:', error));

// document.getElementById('connect-api-button').addEventListener('click', () => {
//   console.log('Connecting to API...');
//   // Add logic to connect to Ollama API here
// });






// document.addEventListener('DOMContentLoaded', () => {
//     const messageContainer = document.getElementById('message-container');
//     const messageInput = document.getElementById('message-input');
//     const sendButton = document.getElementById('send-button');
//     const connectButton = document.getElementById('connect-api-button');
//     const modelSelect = document.getElementById('model-select');
//     const settingsMessage = document.getElementById('settings-message');
  
//     // Function to add a new message to the chat
//     const addMessage = (message, isResponse = false) => {
//       const messageDiv = document.createElement('div');
//       // Add classes for styling
//       messageDiv.className = isResponse ? 'message response' : 'message user';

//       // Set the inner HTML of the message
//       const md = window.markdownit();
//       messageDiv.innerHTML = md.render(message);
  
//       messageContainer.appendChild(messageDiv);
  
//       // Scroll to the bottom
//       messageContainer.scrollTop = messageContainer.scrollHeight;
  
//       // Clear the input field
//       messageInput.value = '';
//       messageInput.style.height = 'auto';
//     };

//     const askOracle = (prompt, model) => {
//         console.log('to prompt');
//         console.log(prompt);
//         fetch('http://localhost:11434/api/generate', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//               model: model,
//               prompt: prompt,
//               stream: false
//             })
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
//             addMessage(data.response, true);
//         }).catch(error => console.error('Error:', error));
//     }
  
//     // Event listener for the send button
//     sendButton.addEventListener('click', () => {
//       if (messageInput.value.trim() === '') return;
//       const userPrompt = messageInput.value;
//       addMessage(userPrompt);
//       askOracle(userPrompt, modelSelect.value);
//       //const oracleResponse = askOracle(messageInput.value);
//       console.log(userPrompt)
//     });
  
//     // Allow sending messages with Enter key
//     messageInput.addEventListener('keypress', (event) => {
//       if (event.key === 'Enter' && !event.shiftKey) {
//         event.preventDefault(); // Prevent a new line
//         addMessage(messageInput.value);
//       }
//     });
  
//     // Automatically resize the textarea as the user types
//     messageInput.addEventListener('input', () => {
//       messageInput.style.height = 'auto'; // Reset height to calculate new height
//       // Calculate new height but cap it at 10 lines
//       const maxHeight = parseInt(getComputedStyle(messageInput).lineHeight, 10) * 10; // Height for 10 lines
//       const newHeight = Math.min(messageInput.scrollHeight, maxHeight);
  
//       messageInput.style.height = `${newHeight}px`; // Set to the new height or max height
//     });
  
//     // Conect to API
//     connectButton.addEventListener('click', () => {
//       console.log('click sto connect');
//       // Clear previous messages
//       settingsMessage.textContent = '';
//       // Fetch models from the API
//       fetch('http://localhost:11434/api/tags')
//         .then((response) => {
//             console.log("Ollama response");
//             console.log(response);
//           if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           if (data.models && Array.isArray(data.models) && data.models.length > 0) {
//             // Clear previous options
//             modelSelect.innerHTML = '';
  
//             // Populate the select element with model names
//             data.models.forEach((model) => {
//               if (model.name) {
//                 const option = document.createElement('option');
//                 option.value = model.name;
//                 option.textContent = model.name;
//                 modelSelect.appendChild(option);
//               }
//             });
  
//             // Automatically select the first model
//             modelSelect.value = data.models[0].name;
  
//             // Show the select element and hide the connect button
//             modelSelect.classList.remove('hidden');
//             connectButton.classList.add('hidden');
  
//             // Enable the textarea and send button
//             messageInput.disabled = false;
//             sendButton.disabled = false;
//           } else {
//             throw new Error('No models available on your system. Please download one https://ollama.com/search?q=llama');
//           }
//         })
//         .catch((error) => {
//           // Display error message
//           settingsMessage.textContent = `Error: ${error.message}. Make sure that the Ollama app is currently running. If it is running, ensure it is accessible on 'localhost:11434'.`;
//         });
//     });

//   });