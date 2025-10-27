export interface LevelInfo {
  bpm: number;
  songName: string;
  artist: string;
  description: string;
  licenseInfo: string;
  attributionUrl: string;
  additionalCredits: string;
  targetText: string | (() => string);
  songUrl: string;
  keyUrl: string;
  durationMins: number;
}
