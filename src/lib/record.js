import SharedAudioContext from './audio/shared-audio-context.js';

const record = (audioBuffer) => {
  let recordedBlobs = []

  let finalStream = new MediaStream();

  const sampleRate = audioBuffer.sampleRate
  const samples = audioBuffer.getChannelData(0)
  const audioContext = new SharedAudioContext();
  let source = audioContext.createBufferSource();
  source.buffer = audioBuffer
  var dest = audioContext.createMediaStreamDestination();
  source.connect(dest)
  dest.stream.getAudioTracks().forEach(function(track) {
    finalStream.addTrack(track);
  });

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(audioStream => {

      const canvas = document.querySelector('canvas');
      const canvasStream = canvas.captureStream(); // frames per second
      let options = {mimeType: 'video/webm'};

      // window.AudioContext = window.AudioContext || window.webkitAudioContext;
      // var ac = new AudioContext();
      var dest = audioContext.createMediaStreamDestination();

      // merge the stream
      audioStream.getAudioTracks().forEach(function(track) {
        finalStream.addTrack(track);
      });
      dest.stream.getAudioTracks().forEach(function(track) {
        finalStream.addTrack(track);
      });
      canvasStream.getVideoTracks().forEach(function(track) {
        finalStream.addTrack(track);
      });

      let mediaRecorder = new MediaRecorder(finalStream, options);
      mediaRecorder.onstop = handleStop;
      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(100); // collect 100ms of data
      source.start();


      setTimeout(() => {
        mediaRecorder.stop();
        const video = document.querySelector('video');
        video.controls = true;
      }, 10000);
    });


  function handleStop(event) {
    const video = document.querySelector('video');
    const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    video.src = window.URL.createObjectURL(superBuffer);
  }

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }
}

export {
  record
};
