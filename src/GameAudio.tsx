import { audioContext } from "./audioContext";

export class GameAudio {
  gainNode = audioContext.createGain();
  songBufferSource = audioContext.createBufferSource();
  keyBufferSource = audioContext.createBufferSource();
  keyGainNode = audioContext.createGain();
  reverbNode = audioContext.createConvolver();
  startedAt: number | null = null;
  constructor() {
    this.songBufferSource.connect(this.gainNode);
    this.keyBufferSource.connect(this.keyGainNode);
    this.keyGainNode.connect(this.reverbNode);
    this.keyGainNode.connect(this.gainNode);
    this.reverbNode.connect(this.gainNode);
    this.gainNode.connect(audioContext.destination);
    this.gainNode.gain.value = 0.75;
    this.keyGainNode.gain.value = 0;
    this.createReverbImpulse();
  }
  createReverbImpulse() {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * 2; // 2 second reverb
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (sampleRate * 0.5));
      impulseL[i] = (Math.random() * 2 - 1) * decay;
      impulseR[i] = (Math.random() * 2 - 1) * decay;
    }

    this.reverbNode.buffer = impulse;
  }
  play(songAudio: AudioBuffer, keyAudio: AudioBuffer) {
    this.songBufferSource.buffer = songAudio;
    this.keyBufferSource.buffer = keyAudio;
    this.songBufferSource.start();
    this.keyBufferSource.start();
    this.startedAt = audioContext.currentTime;
  }
  down() {
    this.keyGainNode.gain.setTargetAtTime(1, audioContext.currentTime, 0.01);
  }
  up() {
    this.keyGainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.01);
  }
}
