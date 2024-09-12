// Speech to Text
const startRecordBtn = document.getElementById('start-record-btn');
const recordedText = document.getElementById('recorded-text');
const promptInput = document.getElementById('promptInput');
const speakResponseBtn = document.getElementById('speakResponseBtn');

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.onstart = function() {
    console.log('Voice recognition started. Speak into the microphone.');
};

recognition.onspeechend = function() {
    console.log('Voice recognition stopped.');
    recognition.stop();
};

recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    console.log('Transcript:', transcript);
    recordedText.textContent = transcript;
    promptInput.value = transcript;  // Copy the recognized text to the textarea
};

recognition.onerror = function(event) {
    console.error('Speech recognition error detected:', event.error);
};

startRecordBtn.addEventListener('click', () => {
    recognition.start();
    console.log('Recording started');
});

// Send the text prompt to Mistral and handle the response
document.getElementById('sendButton').addEventListener('click', function() {
    const prompt = promptInput.value;
    const apiKey = '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'; // Replace this with your actual API key

    if (prompt.trim() === '') {
        alert('Please enter a prompt.');
        return;
    }

    const url = 'https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407/v1/chat/completions';

    const requestBody = {
        model: 'mistralai/Mistral-Nemo-Instruct-2407',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 500,
        stream: false
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json())
    .then(data => {
        const responseContainer = document.getElementById('responseContainer');
        if (data.error) {
            responseContainer.textContent = `Error: ${data.error.message}`;
        } else {
            const responseText = data.choices[0].message.content;
            responseContainer.textContent = responseText;

            // Set the response for Text to Speech
            speakResponseBtn.dataset.response = responseText;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('responseContainer').textContent = 'Error: ' + error;
    });
});

// Text to Speech for response
speakResponseBtn.addEventListener('click', () => {
    const responseText = speakResponseBtn.dataset.response;
    if (responseText) {
        const speech = new SpeechSynthesisUtterance(responseText);
        window.speechSynthesis.speak(speech);
    } else {
        alert('No response to speak.');
    }
});
