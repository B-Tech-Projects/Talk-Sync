document.addEventListener('DOMContentLoaded', function () {
    const languageDropdown = document.getElementById('language');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');

    let recognition = null;

    startButton.addEventListener('click', async function () {
        const selectedLanguage = languageDropdown.value;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted!');

            recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
            recognition.continuous = true;

            recognition.onresult = async function (event) {
                const transcript = event.results[0][0].transcript;
                console.log('Live Transcription:', transcript);

                const apiResponse = await recognizeAudio(transcript, selectedLanguage);
                console.log('Google Cloud Speech-to-Text API Response:', apiResponse);

                const translatedText = await translateText(apiResponse, selectedLanguage);
                console.log('Translated Text:', translatedText);

                alert('Translated Text: ' + translatedText);
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
        }
    }

    // Function to perform translation using Google Cloud Translate API
    async function translateText(text, targetLanguage) {
        const apiKey = 'AIzaSyDWfn8h6XwTHTqB2zs4QY8O_N7HENkb1Ug';

        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'en', // Source language code
                target: targetLanguage,
            }),
        });

        const result = await response.json();
        const translation = result.data.translations[0].translatedText;
        return translation;
    }

    // Function to perform recognition using Google Cloud Speech-to-Text API
    async function recognizeAudio(audioContent, targetLanguage) {
        const apiKey = 'AIzaSyDWvC0WJtOyiUZ-hjopg-vU1Sc4gM4s2tw';
        const apiUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: targetLanguage,
            audioChannelCount: 1,
        };

        const audio = {
            content: audioContent,
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    config: config,
                    audio: audio,
                }),
            });

            const result = await response.json();
            const transcription = result.results.map(result => result.alternatives[0].transcript).join('\n');
            return transcription;
        } catch (error) {
            console.error('Error in speech recognition API:', error);
            return '';
        }
    }
});
