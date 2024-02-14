document.addEventListener('DOMContentLoaded', function () {
    const languageDropdown = document.getElementById('language');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const transcriptionResult = document.getElementById('transcriptionResult');
    const translationResult = document.getElementById('translationResult');

    let recognition = null;

    startButton.addEventListener('click', async function () {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted!');

            recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
            recognition.continuous = true;

            recognition.onresult = async function (event) {
                const transcript = event.results[0][0].transcript;
                console.log('Live Transcription:', transcript);

                // Display the live transcription on the screen
                transcriptionResult.innerText = 'Live Transcription: ' + transcript;

                // Translate the transcript to the selected target language
                const selectedLanguage = languageDropdown.value;
                const translatedText = await translateText(transcript, selectedLanguage);
                console.log('Translated Text:', translatedText);

                // Display the translated text on the screen
                translationResult.innerText = 'Translated Text: ' + translatedText;
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

// Function to perform translation using Google Cloud Translate API
async function translateText(text, targetLanguage) {
    const apiKey = 'AIzaSyDWfn8h6XwTHTqB2zs4QY8O_N7HENkb1Ug';
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'auto',  // Auto-detect the source language
                target: targetLanguage,
            }),
        });

        const result = await response.json();
        console.log('Google Cloud Translate API Response:', result);

        if (response.ok) {
            if (result.data && result.data.translations && result.data.translations.length > 0) {
                const translation = result.data.translations[0].translatedText;
                return translation;
            } else {
                console.error('Translation error:', result);
                return 'Translation not available';
            }
        } else {
            console.error('Google Cloud Translate API Error:', result.error.message);
            return 'Translation not available';
        }
    } catch (error) {
        console.error('Error in translation API:', error);
        return 'Translation not available';
    }
}





});
