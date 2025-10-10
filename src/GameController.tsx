import { atom } from "nanostores";
import { audioContext } from "./audioContext";
import { GameAudio } from "./GameAudio";
import { reverseMorseDB } from "./morse";
import { toVisualization } from "./toVisualization";
import { UpdateTracker } from "./UpdateTracker";

interface LevelInfo {
  bpm: number;
}

interface GameTimer {
  time: number;
}

export class GameController {
  $ready = atom(false);
  $started = atom(false);
  $pressed = atom(false);
  $frameCount = atom(0);

  songAudio: AudioBuffer | null = null;
  keyAudio: AudioBuffer | null = null;
  audio = new GameAudio();
  updateTracker = new UpdateTracker();
  levelInfo: LevelInfo = { bpm: 136 };
  visualization = toVisualization(`________________
________________
HELLO_WORLD___-
TAP_ALONG_THE_MUSIC_AND_
VISUAL_CUES_TO_PRODUCE_
MORSE_CODE_SIGNALS__
REPRODUCE_THE_TEXT_
CORRECTLY_TO_GET_PERFECT_SCORE
________-
A_QUICK_BROWN_FOX_
JUMPS_OVER_THE_LAZY_DOG__
JACKDAWS_LOVE_MY_BIG_SPHINX_
OF_QUARTZ`);
  timer: GameTimer = (() => {
    const getTime = () => {
      if (this.audio.startedAt == null) return 0;
      return audioContext.currentTime - this.audio.startedAt;
    };
    return {
      get time() {
        return getTime();
      },
    };
  })();
  timing = new GameTiming(this.levelInfo);
  keypad = new GameKeypad(this.timer, this.timing);

  async init() {
    await this.loadSound();
  }
  async loadSound() {
    const [song, key] = await Promise.all([
      this.loadAudioBuffer("/songs/tutorial/song.ogg"),
      this.loadAudioBuffer("/songs/tutorial/key.ogg"),
    ]);
    this.songAudio = song;
    this.keyAudio = key;
    this.$ready.set(true);
  }
  async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  }
  start() {
    if (!this.songAudio || !this.keyAudio) {
      throw new Error("Audio not loaded");
    }
    audioContext.resume();
    this.audio.play(this.songAudio, this.keyAudio);
    this.$started.set(true);
    requestAnimationFrame(this.frame.bind(this));
  }
  frame() {
    if (this.audio.startedAt === null) return;
    const elapsed = audioContext.currentTime - this.audio.startedAt;
    const targetFrame = Math.floor(elapsed * 60);
    this.updateTracker.setTarget(targetFrame, () => {
      this.update();
    });
    this.$frameCount.set(this.$frameCount.get() + 1);
    requestAnimationFrame(this.frame.bind(this));
  }
  update() {
    this.keypad.tick();
  }
  down() {
    if (this.$pressed.get()) return;
    this.$pressed.set(true);
    this.audio.down();
    this.keypad.down();
  }
  up() {
    if (!this.$pressed.get()) return;
    this.$pressed.set(false);
    this.audio.up();
    this.keypad.up();
  }
}

export class GameKeypad {
  groups: TapGroup[] = [];
  currentGroup: TapGroup | null = null;
  constructor(private timer: GameTimer, private timing: GameTiming) {}
  down() {
    if (this.currentGroup) {
      const latestTap = this.currentGroup.taps.at(-1);
      if (
        latestTap &&
        latestTap.gapAfterSeconds > this.timing.unitsToSeconds(2)
      ) {
        this.currentGroup.finishedAt ??= this.timer.time;
        this.currentGroup = null;
      }
    }
    this.currentGroup ??= (() => {
      const group = new TapGroup(this.timer.time, this.timing);
      this.groups.push(group);
      return group;
    })();
    this.currentGroup.down(this.timer.time);
  }
  up() {
    this.currentGroup?.up(this.timer.time);
  }
  tick() {
    this.currentGroup?.tick(this.timer.time);
    if (this.currentGroup && this.currentGroup.finishedAt == null) {
      const latestTap = this.currentGroup.taps.at(-1);
      if (
        latestTap &&
        latestTap.gapAfterSeconds > this.timing.unitsToSeconds(2)
      ) {
        this.currentGroup.finishedAt = this.timer.time;
      }
    }
  }
}

interface TapGroupInterpretation {
  morse: string;
  char: string;
}

export class TapGroup {
  taps: Tap[] = [];
  isDown = false;
  finishedAt: number | null = null;
  private _cachedInterpretation: TapGroupInterpretation | null = null;
  constructor(public startedAt: number, private timing: GameTiming) {}
  down(time: number) {
    if (this.isDown) return;
    this.isDown = true;
    const tap = new Tap();
    tap.pressedAt = time;
    tap.durationSeconds += 1 / 60;
    this.taps.push(tap);
  }
  up(time: number) {
    if (!this.isDown) return;
    this.isDown = false;
    const tap = this.taps[this.taps.length - 1];
    if (tap) {
      tap.releasedAt = time;
    }
  }
  tick(time: number) {
    void time;
    const tap = this.taps[this.taps.length - 1];
    if (!tap) return;
    if (this.isDown) {
      tap.durationSeconds += 1 / 60;
    } else {
      tap.gapAfterSeconds += 1 / 60;
    }
  }
  get interpretation() {
    if (this._cachedInterpretation) return this._cachedInterpretation;
    this._cachedInterpretation = this._interpret();
    return this._cachedInterpretation;
  }
  private _interpret() {
    if (!this.finishedAt) return null;
    const morse = this.taps
      .map((tap) => {
        const durationUnits = this.timing.secondsToUnits(tap.durationSeconds);
        return durationUnits < 2 ? "." : "-";
      })
      .join("");
    const char = reverseMorseDB.get(morse) || "?";
    return { morse, char };
  }
}

export class Tap {
  pressedAt = 0;
  releasedAt: number | null = null;
  durationSeconds = 0;
  gapAfterSeconds = 0;
}

export class GameTiming {
  constructor(private levelInfo: LevelInfo) {}
  secondsToUnits(seconds: number) {
    return ((seconds * this.levelInfo.bpm) / 60) * 4;
  }
  unitsToSeconds(units: number) {
    return (units * 60) / (this.levelInfo.bpm * 4);
  }
}
