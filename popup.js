document.addEventListener('DOMContentLoaded', function () {
    const sourceLanguageDropdown = document.getElementById('sourceLanguage');
    const targetLanguageDropdown = document.getElementById('targetLanguage');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const conversationResult = document.getElementById('conversationResult');

    let recognition = null;
    let currentTranscription = ''; // Track the current transcription

    startButton.addEventListener('click', async function () {
        try {
            const sourceLanguage = sourceLanguageDropdown.value;
            const targetLanguage = targetLanguageDropdown.value;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted!');

            recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
            recognition.continuous = true;
            recognition.interimResults = true; // Enable interim results
            recognition.lang = sourceLanguage;

            recognition.onresult = function (event) {
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    interimTranscript += event.results[i][0].transcript + ' ';
                }

                // Update the current transcription with the interim transcript
                currentTranscription = interimTranscript;

                // Display the live transcription on the screen
                conversationResult.innerText = 'Live Transcription: ' + currentTranscription;

                // Translate the transcript to the selected target language
                translateAndDisplay(currentTranscription, sourceLanguage, targetLanguage);
            };

            recognition.start();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    stopButton.addEventListener('click', function () {
        stopRecognition();
    });

    // Function to stop recognition and release the microphone
    function stopRecognition() {
        if (recognition) {
            recognition.stop();
            console.log('Recognition stopped');
        }
    }

    // Function to perform translation using Google Cloud Translate API and display on the screen
    async function translateAndDisplay(text, sourceLanguage, targetLanguage) {
        const apiKey = 'AIzaSyAG4b6EvtKIO4EypNkbKgiLrQqB9Q3-loY';
        const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: sourceLanguage,
                target: targetLanguage,
            }),
        });

        const result = await response.json();

        if (result.data && result.data.translations && result.data.translations.length > 0) {
            const translation = result.data.translations[0].translatedText;
            
            // Display the translated text on the screen
            conversationResult.innerText += '\n\nTranslated Text: ' + translation;
        } else {
            console.error('Translation error:', result);
            conversationResult.innerText += '\n\nTranslation not available';
        }
    }
});
