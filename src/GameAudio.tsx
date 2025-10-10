import { audioContext } from "./audioContext";

export class GameAudio {
  gainNode = audioContext.createGain();
  songBufferSource = audioContext.createBufferSource();
  keyBufferSource = audioContext.createBufferSource();
  keyGainNode = audioContext.createGain();
  startedAt: number | null = null;
  constructor() {
    this.songBufferSource.connect(this.gainNode);
    this.keyBufferSource.connect(this.keyGainNode);
    this.gainNode.connect(audioContext.destination);
    this.keyGainNode.connect(this.gainNode);
    this.gainNode.gain.value = 0.75;
    this.keyGainNode.gain.value = 0;
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
