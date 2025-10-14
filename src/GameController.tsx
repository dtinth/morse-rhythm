import { diffStringsRaw } from "jest-diff";
import memoizeOne from "memoize-one";
import { atom, type WritableAtom } from "nanostores";
import { audioContext } from "./audioContext";
import { GameAudio } from "./GameAudio";
import type { LevelInfo } from "./LevelInfo";
import { forgottenland, levels } from "./levels";
import { reverseMorseDB } from "./morse";
import { toVisualization } from "./toVisualization";
import { UpdateTracker } from "./UpdateTracker";

interface GameTimer {
  time: number;
}

interface ScoreInfo {
  scoreFraction: number;
  common: number;
  total: number;
}

export class GameController {
  $ready = atom(false);
  $started = atom(false);
  $finished = atom(false);
  $pressed = atom(false);
  $time = atom(0);
  $frameCount = atom(0);
  $hardMode = atom(false);

  songAudio: AudioBuffer | null = null;
  keyAudio: AudioBuffer | null = null;
  audio = new GameAudio();
  updateTracker = new UpdateTracker();

  levelInfo: LevelInfo;
  visualization: string[];
  timing: GameTiming;
  keypad: GameKeypad;
  targetChars: string;
  startTime: number;
  endTime: number;
  $score: WritableAtom<ScoreInfo>;

  $autoDit = atom(false);
  $autoDah = atom(false);

  constructor(private levelName: string) {
    this.levelInfo = levels.get(this.levelName) || forgottenland;
    this.visualization = toVisualization(this.levelInfo.targetText);
    this.timing = new GameTiming(this.levelInfo);
    this.keypad = new GameKeypad(this.timer, this.timing);
    this.targetChars = Array.from(this.levelInfo.targetText)
      .filter((x) => x.match(/^[A-Z]$/))
      .join("");
    this.startTime = (() => {
      const firstUnit = this.visualization.findIndex((x) => x);
      return this.timing.unitsToSeconds(firstUnit);
    })();
    this.endTime = this.timing.unitsToSeconds(this.visualization.length);
    this.$score = atom(this.getCurrentScore());
  }

  private animationFrameId: number | null = null;
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
  get currentChars() {
    const out: string[] = [];
    const endTime = this.endTime;
    for (const group of this.keypad.groups) {
      if (group.startedAt > endTime + 1) break;
      const interpretation = group.interpretation;
      if (interpretation?.char) {
        out.push(interpretation.char);
      }
    }
    return out.join("");
  }
  private getCurrentScore = (() => {
    const computeScore = memoizeOne(
      (current: string, target: string): ScoreInfo => {
        const diff = diffStringsRaw(target, current, false);
        let total = 0;
        let common = 0;
        for (const item of diff) {
          if (item[0] === 0) {
            total += item[1].length;
            common += item[1].length;
          } else {
            total += item[1].length;
          }
        }
        return { scoreFraction: common / total, common, total };
      }
    );
    return () => computeScore(this.currentChars, this.targetChars);
  })();

  async init() {
    await this.loadSound();
  }
  async loadSound() {
    const [song, key] = await Promise.all([
      this.loadAudioBuffer(this.levelInfo.songUrl),
      this.loadAudioBuffer(this.levelInfo.keyUrl),
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
    this.executeAuto();
    const elapsed = audioContext.currentTime - this.audio.startedAt;
    const targetFrame = Math.floor(elapsed * 60);
    this.updateTracker.setTarget(targetFrame, () => {
      this.update();
    });
    this.$frameCount.set(this.$frameCount.get() + 1);
    this.$time.set(this.timer.time);
    this.$score.set(this.getCurrentScore());
    if (this.timer.time >= this.endTime + 1 && !this.$finished.get()) {
      this.$finished.set(true);
    }
    this.animationFrameId = requestAnimationFrame(this.frame.bind(this));
  }
  update() {
    this.keypad.tick();
  }
  down() {
    if (this.$pressed.get()) return;
    this.$pressed.set(true);
    this.audio.down();
    if (this.timer.time < this.startTime - 1) return;
    this.keypad.down();
  }
  up() {
    if (!this.$pressed.get()) return;
    this.$pressed.set(false);
    this.audio.up();
    if (this.timer.time < this.startTime - 1) return;
    this.keypad.up();
  }
  dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.audio.dispose();
  }
  auto(signal: "." | "-", pressed: boolean) {
    if (signal === ".") {
      this.$autoDit.set(pressed);
    } else {
      this.$autoDah.set(pressed);
    }
  }
  autoKeyer = new AutoKeyer(
    () => this.up(),
    () => this.down()
  );
  executeAuto() {
    this.autoKeyer.execute(
      this.$autoDit.get(),
      this.$autoDah.get(),
      this.timing.secondsToUnits(this.timer.time)
    );
  }
}

class AutoKeyer {
  active: {
    nextEvalUnit: number;
    queue: boolean[];
    latest: boolean;
    lastAction: "dit" | "dah";
  } | null = null;

  constructor(private up: () => void, private down: () => void) {}
  execute(autoDit: boolean, autoDah: boolean, unit: number) {
    if (!this.active && (autoDah || autoDit)) {
      this.active = {
        nextEvalUnit: unit,
        queue: [],
        latest: false,
        lastAction: autoDah ? "dah" : "dit",
      };
    }
    if (this.active && unit >= this.active.nextEvalUnit) {
      if (this.active.queue.length === 0) {
        if (autoDah && autoDit) {
          if (this.active.lastAction === "dit") {
            autoDit = false;
          } else {
            autoDah = false;
          }
        }
        if (autoDah) {
          this.active.queue.push(true, true, true, false);
          this.active.lastAction = "dah";
        } else if (autoDit) {
          this.active.queue.push(true, false);
          this.active.lastAction = "dit";
        } else {
          this.active = null;
          return;
        }
      }
      const next = this.active.queue.shift()!;
      if (next !== this.active.latest) {
        if (next) {
          this.down();
        } else {
          this.up();
        }
        this.active.latest = next;
      }
      this.active.nextEvalUnit += 1;
    }
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
