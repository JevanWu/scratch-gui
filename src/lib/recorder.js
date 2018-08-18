class Recorder {
  constructor(){
    this.recordedBlobs = [];

    this.finalStream = new MediaStream();

    // const sampleRate = audioBuffer.sampleRate
    // const samples = audioBuffer.getChannelData(0)
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.dest = this.audioContext.createMediaStreamDestination();

    this.mediaRecorder = null
    this.start.bind(this)
    this.stop.bind(this)
    this.handleStop.bind(this)
    this.handleDataAvailable.bind(this)
    this.addAudioBufferSource.bind(this)
  }

  addAudioBufferSource(audioContext, audioBuffer){
    let source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer
    source.connect(this.dest)
    source.start()
  }

  start(){
    let that = this
    let options = {mimeType: 'video/webm'};
    this.mediaRecorder = new MediaRecorder(this.finalStream, options);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(audioStream => {

        const canvas = document.querySelector('canvas');
        const canvasStream = canvas.captureStream(); // frames per second

        // window.AudioContext = window.AudioContext || window.webkitAudioContext;
        // var ac = new AudioContext();
        // var dest = audioContext.createMediaStreamDestination();

        // merge the stream
        that.dest.stream.getAudioTracks().forEach(function(track) {
          that.finalStream.addTrack(track);
        });

        audioStream.getAudioTracks().forEach(function(track) {
          that.finalStream.addTrack(track);
        });

        canvasStream.getVideoTracks().forEach(function(track) {
          that.finalStream.addTrack(track);
        });

        that.mediaRecorder.onstop = that.handleStop.bind(that);
        that.mediaRecorder.ondataavailable = that.handleDataAvailable.bind(that);
        that.mediaRecorder.start(); // collect 100ms of data
      });
  }

  stop(){
    this.mediaRecorder.stop();
    this.finalStream = new MediaStream();
    this.recordedBlobs = [];
    const video = document.querySelector('video');
    video.controls = true;
  }

  handleStop(){
    const video = document.querySelector('video');
    const superBuffer = new Blob(this.recordedBlobs, {type: 'video/webm'});
    video.innerHtml = '';
    video.src = window.URL.createObjectURL(superBuffer);
  }

  handleDataAvailable(event){
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data);
    }
  }
}

function initRecorder(){
  if(window.recorder == undefined){
    window.recorder = new Recorder()
  }

  return window.recorder
}

export {
  initRecorder
};
