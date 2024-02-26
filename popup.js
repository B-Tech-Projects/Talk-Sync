document.addEventListener('DOMContentLoaded', function () {
    const sourceLanguageDropdown = document.getElementById('sourceLanguage');
    const targetLanguageDropdown = document.getElementById('targetLanguage');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const conversationResult = document.getElementById('conversationResult');
    let audioElement = null;

    let recognition = null;
    let isTranscribing = false;
    let spokenSentences = new Set(); // Keep track of spoken sentences

    startButton.addEventListener('click', async function () {
        try {
            const sourceLanguage = sourceLanguageDropdown.value;
            const targetLanguage = targetLanguageDropdown.value;

            // Access the microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted!');

            // Initialize speech recognition
            recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = sourceLanguage;

            recognition.onresult = function (event) {
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript = event.results[i][0].transcript.trim();

                        // Check if the sentence is not repeated
                        if (!spokenSentences.has(finalTranscript)) {
                            // Display the live transcription
                            conversationResult.innerText = 'Live Transcription: ' + finalTranscript;

                            if (isTranscribing) {
                                // Translate and speak asynchronously
                                translateAndSpeak(finalTranscript, sourceLanguage, targetLanguage);
                                // Add the sentence to the spoken set to avoid repetition
                                spokenSentences.add(finalTranscript);
                            }
                        }
                    }
                }
            };

            recognition.start();
            isTranscribing = true;
        } catch (error) {
            console.error('Error:', error);
        }
    });

    stopButton.addEventListener('click', function () {
        stopTranscription();
    });

    function stopTranscription() {
        if (recognition) {
            recognition.stop();
            console.log('Transcription stopped');
            isTranscribing = false;
            spokenSentences.clear();
        }
    }

    async function translateAndSpeak(text, sourceLanguage, targetLanguage) {
        try {
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

                // Display the translated text
                conversationResult.innerText += '\n\nTranslated Text: ' + translation;

                // Speak the translated text asynchronously
                speakText(translation, targetLanguage);
            } else {
                console.error('Translation error:', result);
                conversationResult.innerText += '\n\nTranslation not available';
            }
        } catch (error) {
            console.error('Translation error:', error);
            conversationResult.innerText += '\n\nTranslation not available';
        }
    }

    async function speakText(text, targetLanguage) {
        if (audioElement) {
            audioElement.pause();
            audioElement = null;
        }

        const audioUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
            text
        )}&tl=${targetLanguage}&client=tw-ob`;

        audioElement = new Audio(audioUrl);

        const playPromise = audioElement.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {}).catch(error => {
                console.error('Audio play error:', error);
            });
        }
    }
});
