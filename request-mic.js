document.addEventListener('DOMContentLoaded', function () {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            console.log('Microphone access granted!', stream);
            // You can now use the stream for audio processing
        })
        .catch(function (error) {
            console.error('Error getting microphone access:', error);
        });
});
